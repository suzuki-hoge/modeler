use std::time::{Duration, Instant};

use actix::{
    fut::ready, Actor, ActorContext, ActorFutureExt, Addr, AsyncContext, ContextFutureSpawner, Handler,
    Message as ActixMessage, Running, StreamHandler, WrapFuture,
};
use actix_web_actors::ws::{Message as WsMessage, ProtocolError, WebsocketContext};
use serde_json::from_str as from_json_str;
use uuid::Uuid;

use crate::actor::message::connection::connect::ConnectRequest;
use crate::actor::message::connection::disconnect::DisconnectRequest;
use crate::actor::message::edge::add_edge::AddEdgeRequest;
use crate::actor::message::edge::delete_edge::DeleteEdgeRequest;
use crate::actor::message::edge::update_edge::UpdateEdgeRequest;
use crate::actor::message::node::add_node::AddNodeRequest;
use crate::actor::message::node::delete_node::DeleteNodeRequest;
use crate::actor::message::node::header::update_icon::UpdateIconRequest;
use crate::actor::message::node::header::update_name::UpdateNameRequest;
use crate::actor::message::node::method::delete_method::DeleteMethodRequest;
use crate::actor::message::node::method::insert_method::InsertMethodRequest;
use crate::actor::message::node::method::update_method::UpdateMethodRequest;
use crate::actor::message::node::move_node::MoveNodeRequest;
use crate::actor::message::node::property::delete_property::DeletePropertyRequest;
use crate::actor::message::node::property::insert_property::InsertPropertyRequest;
use crate::actor::message::node::property::update_property::UpdatePropertyRequest;
use crate::actor::message::state::lock::LockRequest;
use crate::actor::message::state::unlock::UnlockRequest;
use crate::actor::message::Json;
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

    fn handle_json(&mut self, json: Json) -> Result<(), String> {
        match json.get("type").and_then(|v| v.as_str()) {
            // state
            Some("lock") => self.server_address.do_send(LockRequest::parse(&self.session_id, &self.page_id, json)?),
            Some("unlock") => self.server_address.do_send(UnlockRequest::parse(&self.session_id, &self.page_id, json)?),

            // node
            Some("add-node") => {
                self.server_address.do_send(AddNodeRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some("move-node") => {
                self.server_address.do_send(MoveNodeRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some("delete-node") => {
                self.server_address.do_send(DeleteNodeRequest::parse(&self.session_id, &self.page_id, json)?)
            }

            Some("update-icon") => {
                self.server_address.do_send(UpdateIconRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some("update-name") => {
                self.server_address.do_send(UpdateNameRequest::parse(&self.session_id, &self.page_id, json)?)
            }

            Some("insert-property") => {
                self.server_address.do_send(InsertPropertyRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some("update-property") => {
                self.server_address.do_send(UpdatePropertyRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some("delete-property") => {
                self.server_address.do_send(DeletePropertyRequest::parse(&self.session_id, &self.page_id, json)?)
            }

            Some("insert-method") => {
                self.server_address.do_send(InsertMethodRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some("update-method") => {
                self.server_address.do_send(UpdateMethodRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some("delete-method") => {
                self.server_address.do_send(DeleteMethodRequest::parse(&self.session_id, &self.page_id, json)?)
            }

            // edge
            Some("add-edge") => {
                self.server_address.do_send(AddEdgeRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some("update-edge") => {
                self.server_address.do_send(UpdateEdgeRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some("delete-edge") => {
                self.server_address.do_send(DeleteEdgeRequest::parse(&self.session_id, &self.page_id, json)?)
            }

            Some(s) => Err(format!("unexpected typ: {s}"))?,
            None => Err(String::from("type missing"))?,
        };
        Ok(())
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
                    let json: Json = from_json_str(byte.trim()).unwrap();
                    match self.handle_json(json) {
                        Ok(_) => {}
                        Err(e) => println!("some errors occurred: {e}"),
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
