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

use crate::server::{BroadcastRequest, ChatServer, ConnectRequest, DisconnectRequest, PageId};

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

pub type SessionId = usize;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct NoticeRequest {
    pub kind: String,
    pub message: String,
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
        Self { kind: value.kind, message: value.message }
    }
}

impl Display for ClientJson {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", to_json_string(self).unwrap())
    }
}

#[derive(Debug)]
pub struct WsChatSession {
    pub id: SessionId,
    pub last_heartbeat: Instant,
    pub page_id: PageId,
    pub server_address: Addr<ChatServer>,
}

impl WsChatSession {
    fn boot_heartbeat(&self, context: &mut WebsocketContext<Self>) {
        context.run_interval(HEARTBEAT_INTERVAL, |actor, context| {
            if Instant::now().duration_since(actor.last_heartbeat) > CLIENT_TIMEOUT {
                println!("session: client heartbeat failed, disconnecting");

                actor.server_address.do_send(DisconnectRequest { requester: actor.id });

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
            .send(ConnectRequest { session_address: session_address.recipient() })
            .into_actor(self)
            .then(|new_session_id, actor, context| {
                match new_session_id {
                    Ok(new_session_id) => actor.id = new_session_id,
                    _ => context.stop(),
                }
                ready(())
            })
            .wait(context);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        println!("session: stop");
        self.server_address.do_send(DisconnectRequest { requester: self.id });
        Running::Stop
    }
}

impl Handler<NoticeRequest> for WsChatSession {
    type Result = ();

    fn handle(&mut self, request: NoticeRequest, context: &mut Self::Context) {
        let client_json = ClientJson::from(request);

        println!("session: notice request accepted, send [ {} ] to {}", &client_json, &self.id);

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
                    println!("session: receive text [ {} ]", &client_json);
                    println!("session -> server");
                    self.server_address.do_send(BroadcastRequest {
                        requester: self.id,
                        message: client_json.message,
                        page_id: self.page_id.clone(),
                    })
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
