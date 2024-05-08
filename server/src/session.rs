use std::fmt::{Display, Formatter};
use std::time::{Duration, Instant};

use actix::{
    fut::ready, Actor, ActorContext, ActorFutureExt, Addr, AsyncContext, ContextFutureSpawner, Handler,
    Message as ActixMessage, Running, StreamHandler, WrapFuture,
};
use actix_web_actors::ws::{Message as WsMessage, ProtocolError, WebsocketContext};
use bytestring::ByteString;
use serde::{Deserialize, Serialize};
use serde_json::{from_str as from_json_str, to_string as to_json_string};
use uuid::Uuid;

use crate::server::{
    BroadcastRequest, ChatServer, ConnectRequest, DisconnectRequest, LockRequest, ObjectId, PageId, UnlockRequest,
};
use crate::session::NoticeKind::{Broadcast, Connected, Disconnected, Lock, Unlock};

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

pub type SessionId = String;

pub fn create_session_id() -> SessionId {
    Uuid::new_v4().to_string().split('-').next().unwrap().to_string()
}

#[derive(ActixMessage, Clone)]
#[rtype(result = "()")]
pub struct NoticeRequest {
    pub kind: NoticeKind,
    pub message: String,
}

#[derive(ActixMessage, Clone)]
#[rtype(result = "()")]
pub enum NoticeKind {
    Connected,
    Disconnected,
    Broadcast,
    Lock,
    Unlock,
}

impl NoticeRequest {
    pub fn connected(session_id: &SessionId) -> Self {
        Self { kind: Connected, message: session_id.clone() }
    }

    pub fn disconnected(session_id: &SessionId) -> Self {
        Self { kind: Disconnected, message: session_id.clone() }
    }

    pub fn broadcast<S: Into<String>>(s: S) -> Self {
        Self { kind: Broadcast, message: s.into() }
    }

    pub fn lock(object_id: ObjectId) -> Self {
        Self { kind: Lock, message: object_id }
    }

    pub fn unlock(object_id: ObjectId) -> Self {
        Self { kind: Unlock, message: object_id }
    }
}

#[derive(Serialize, Deserialize)]
struct ClientJson {
    pub kind: String,
    pub message: String,
}

impl From<ClientJson> for ByteString {
    fn from(value: ClientJson) -> Self {
        to_json_string(&value).unwrap().into()
    }
}

impl From<ByteString> for ClientJson {
    fn from(value: ByteString) -> Self {
        from_json_str(value.trim()).unwrap()
    }
}

impl From<NoticeRequest> for ClientJson {
    fn from(value: NoticeRequest) -> Self {
        Self {
            kind: match value.kind {
                Connected => "connected",
                Disconnected => "disconnected",
                Broadcast => "broadcast",
                Lock => "lock",
                Unlock => "unlock",
            }
            .to_string(),
            message: value.message,
        }
    }
}

impl Display for ClientJson {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", to_json_string(self).unwrap())
    }
}

#[derive(Debug)]
pub struct WsChatSession {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub server_address: Addr<ChatServer>,
    pub last_heartbeat: Instant,
}

impl WsChatSession {
    fn boot_heartbeat(&self, context: &mut WebsocketContext<Self>) {
        context.run_interval(HEARTBEAT_INTERVAL, |actor, context| {
            if Instant::now().duration_since(actor.last_heartbeat) > CLIENT_TIMEOUT {
                println!("session: client heartbeat failed, disconnecting");

                actor.server_address.do_send(DisconnectRequest {
                    session_id: actor.session_id.clone(),
                    page_id: actor.page_id.clone(),
                });

                context.stop();

                return;
            }

            context.ping(b"");
        });
    }
}

impl Actor for WsChatSession {
    type Context = WebsocketContext<Self>;

    fn started(&mut self, context: &mut Self::Context) {
        println!("session: start");
        self.boot_heartbeat(context);

        let session_address = context.address();
        self.server_address
            .send(ConnectRequest {
                session_id: self.session_id.clone(),
                page_id: self.page_id.clone(),
                session_address: session_address.recipient(),
            })
            .into_actor(self)
            .then(|_, _, _| ready(()))
            .wait(context);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        println!("session: stop");
        self.server_address
            .do_send(DisconnectRequest { session_id: self.session_id.clone(), page_id: self.page_id.clone() });
        Running::Stop
    }
}

impl Handler<NoticeRequest> for WsChatSession {
    type Result = ();

    fn handle(&mut self, request: NoticeRequest, context: &mut Self::Context) {
        let client_json = ClientJson::from(request);

        println!("session: notice request accepted by {} in {} [ {} ]", &self.session_id, &self.page_id, &client_json);

        context.text(client_json);
    }
}

impl StreamHandler<Result<WsMessage, ProtocolError>> for WsChatSession {
    fn handle(&mut self, message: Result<WsMessage, ProtocolError>, context: &mut Self::Context) {
        if let Ok(message) = message {
            match message {
                WsMessage::Ping(byte) => {
                    self.last_heartbeat = Instant::now();
                    context.pong(&byte);
                }
                WsMessage::Pong(_) => {
                    self.last_heartbeat = Instant::now();
                }
                WsMessage::Text(byte) => {
                    let client_json = ClientJson::from(byte);
                    println!("session: receive text by {} in {} [ {} ]", &self.session_id, &self.page_id, &client_json);
                    println!("session -> server");
                    match client_json.kind.as_str() {
                        "connected" | "disconnected" => panic!("unexpected"),
                        "broadcast" => self.server_address.do_send(BroadcastRequest {
                            session_id: self.session_id.clone(),
                            page_id: self.page_id.clone(),
                            message: client_json.message,
                        }),
                        "lock" => self.server_address.do_send(LockRequest {
                            session_id: self.session_id.clone(),
                            page_id: self.page_id.clone(),
                            object_id: "foo".to_string(),
                        }),
                        "unlock" => self.server_address.do_send(UnlockRequest {
                            session_id: self.session_id.clone(),
                            page_id: self.page_id.clone(),
                            object_id: "foo".to_string(),
                        }),
                        _ => {}
                    }
                }
                WsMessage::Binary(_) => {
                    println!("session: binary message is not supported")
                }
                WsMessage::Close(reason) => {
                    context.close(reason);
                    context.stop();
                }
                WsMessage::Continuation(_) => {
                    context.stop();
                }
                WsMessage::Nop => (),
            }
        } else {
            context.stop();
        }
    }
}
