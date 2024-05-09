use std::collections::HashMap;
use std::time::{Duration, Instant};

use actix::{
    fut::ready, Actor, ActorContext, ActorFutureExt, Addr, AsyncContext, ContextFutureSpawner, Handler,
    Message as ActixMessage, Running, StreamHandler, WrapFuture,
};
use actix_web_actors::ws::{Message as WsMessage, ProtocolError, WebsocketContext};
use serde_json::{from_str as from_json_str, Value};
use uuid::Uuid;

use crate::actor::message::connect::ConnectRequest;
use crate::actor::message::disconnect::DisconnectRequest;
use crate::actor::message::lock::LockRequest;
use crate::actor::message::unlock::UnlockRequest;
use crate::actor::server::Server;
use crate::actor::{PageId, SessionId};

pub fn create_session_id() -> SessionId {
    Uuid::new_v4().to_string().split('-').next().unwrap().to_string()
}

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

pub struct Session {
    pub session_id: SessionId,
    pub user: String,
    pub page_id: PageId,
    pub server_address: Addr<Server>,
    pub last_heartbeat: Instant,
}

impl Session {
    fn boot_heartbeat(&self, context: &mut WebsocketContext<Self>) {
        context.run_interval(HEARTBEAT_INTERVAL, |actor, context| {
            if Instant::now().duration_since(actor.last_heartbeat) > CLIENT_TIMEOUT {
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

impl Actor for Session {
    type Context = WebsocketContext<Self>;

    fn started(&mut self, context: &mut Self::Context) {
        self.boot_heartbeat(context);

        let session_address = context.address();
        self.server_address
            .send(ConnectRequest {
                session_id: self.session_id.clone(),
                user: self.user.clone(),
                page_id: self.page_id.clone(),
                session_address: session_address.recipient(),
            })
            .into_actor(self)
            .then(|_, _, _| ready(()))
            .wait(context);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        self.server_address
            .do_send(DisconnectRequest { session_id: self.session_id.clone(), page_id: self.page_id.clone() });
        Running::Stop
    }
}

impl StreamHandler<Result<WsMessage, ProtocolError>> for Session {
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
                    let map: HashMap<String, Value> = from_json_str(byte.trim()).unwrap();
                    match map.get("type").and_then(|v| v.as_str()) {
                        Some("lock") => match LockRequest::parse(self.session_id.clone(), self.page_id.clone(), map) {
                            Ok(request) => self.server_address.do_send(request),
                            Err(e) => println!("{}", e),
                        },
                        Some("unlock") => {
                            match UnlockRequest::parse(self.session_id.clone(), self.page_id.clone(), map) {
                                Ok(request) => self.server_address.do_send(request),
                                Err(e) => println!("{}", e),
                            }
                        }
                        Some(s) => println!("unexpected typ: {}", s),
                        None => println!("type missing"),
                    }
                }
                WsMessage::Binary(_) => {
                    println!("binary message is not supported")
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

#[derive(ActixMessage, Clone)]
#[rtype(result = "()")]
pub struct Response {
    pub json: String,
}

impl Handler<Response> for Session {
    type Result = ();

    fn handle(&mut self, response: Response, context: &mut Self::Context) {
        context.text(response.json);
    }
}
