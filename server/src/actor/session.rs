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
use crate::actor::message::information::error_information::ErrorInformationResponse;
use crate::actor::message::page::edge::add_edge::AddEdgeRequest;
use crate::actor::message::page::edge::remove_edge::RemoveEdgeRequest;
use crate::actor::message::page::edge::{add_edge, remove_edge};
use crate::actor::message::page::node::add_node::AddNodeRequest;
use crate::actor::message::page::node::move_node::MoveNodeRequest;
use crate::actor::message::page::node::remove_node::RemoveNodeRequest;
use crate::actor::message::page::node::{add_node, move_node, remove_node};
use crate::actor::message::project::edge::create_edge::CreateEdgeRequest;
use crate::actor::message::project::edge::delete_edge::DeleteEdgeRequest;
use crate::actor::message::project::edge::update_arrow_type::UpdateArrowTypeRequest;
use crate::actor::message::project::edge::update_connection::UpdateConnectionRequest;
use crate::actor::message::project::edge::update_label::UpdateLabelRequest;
use crate::actor::message::project::edge::{
    create_edge, delete_edge, update_arrow_type, update_connection, update_label,
};
use crate::actor::message::project::node::create_node::CreateNodeRequest;
use crate::actor::message::project::node::delete_node::DeleteNodeRequest;
use crate::actor::message::project::node::update_icon_id::UpdateIconIdRequest;
use crate::actor::message::project::node::update_methods::UpdateMethodsRequest;
use crate::actor::message::project::node::update_name::UpdateNameRequest;
use crate::actor::message::project::node::update_properties::UpdatePropertiesRequest;
use crate::actor::message::project::node::{
    create_node, delete_node, update_icon_id, update_methods, update_name, update_properties,
};
use crate::actor::message::user::config::update_user_config;
use crate::actor::message::user::config::update_user_config::UpdateUserConfigRequest;
use crate::actor::message::Json;
use crate::actor::server::Server;
use crate::actor::SessionId;
use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::data::user::UserId;
use crate::logger;

pub fn create_session_id() -> SessionId {
    Uuid::new_v4().to_string()
}

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

pub struct Session {
    pub session_id: SessionId,
    pub user_id: UserId,
    pub project_id: ProjectId,
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
                    project_id: actor.project_id.clone(),
                });

                context.stop();

                return;
            }

            context.ping(b"");
        });
    }

    fn handle_json(&mut self, json: Json) -> Result<(), String> {
        match json.get("type").and_then(|v| v.as_str()) {
            // user

            // config
            Some(update_user_config::TYPE) => {
                self.server_address.do_send(UpdateUserConfigRequest::parse(&self.session_id, json)?)
            }

            // project

            // node
            Some(create_node::TYPE) => {
                self.server_address.do_send(CreateNodeRequest::parse(&self.session_id, &self.project_id, json)?)
            }
            Some(delete_node::TYPE) => {
                self.server_address.do_send(DeleteNodeRequest::parse(&self.session_id, &self.project_id, json)?)
            }
            Some(update_name::TYPE) => {
                self.server_address.do_send(UpdateNameRequest::parse(&self.session_id, &self.project_id, json)?)
            }
            Some(update_icon_id::TYPE) => {
                self.server_address.do_send(UpdateIconIdRequest::parse(&self.session_id, &self.project_id, json)?)
            }
            Some(update_properties::TYPE) => {
                self.server_address.do_send(UpdatePropertiesRequest::parse(&self.session_id, &self.project_id, json)?)
            }
            Some(update_methods::TYPE) => {
                self.server_address.do_send(UpdateMethodsRequest::parse(&self.session_id, &self.project_id, json)?)
            }

            // edge
            Some(create_edge::TYPE) => {
                self.server_address.do_send(CreateEdgeRequest::parse(&self.session_id, &self.project_id, json)?)
            }
            Some(update_connection::TYPE) => {
                self.server_address.do_send(UpdateConnectionRequest::parse(&self.session_id, &self.project_id, json)?)
            }
            Some(update_arrow_type::TYPE) => {
                self.server_address.do_send(UpdateArrowTypeRequest::parse(&self.session_id, &self.project_id, json)?)
            }
            Some(update_label::TYPE) => {
                self.server_address.do_send(UpdateLabelRequest::parse(&self.session_id, &self.project_id, json)?)
            }
            Some(delete_edge::TYPE) => {
                self.server_address.do_send(DeleteEdgeRequest::parse(&self.session_id, &self.project_id, json)?)
            }

            // page

            // node
            Some(add_node::TYPE) => {
                self.server_address.do_send(AddNodeRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some(remove_node::TYPE) => {
                self.server_address.do_send(RemoveNodeRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some(move_node::TYPE) => {
                self.server_address.do_send(MoveNodeRequest::parse(&self.session_id, &self.page_id, json)?)
            }

            // edge
            Some(add_edge::TYPE) => {
                self.server_address.do_send(AddEdgeRequest::parse(&self.session_id, &self.page_id, json)?)
            }
            Some(remove_edge::TYPE) => {
                self.server_address.do_send(RemoveEdgeRequest::parse(&self.session_id, &self.page_id, json)?)
            }

            Some(s) => Err(format!("unexpected type: {s}"))?,
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
                user_id: self.user_id.clone(),
                project_id: self.project_id.clone(),
                page_id: self.page_id.clone(),
                session_address: session_address.recipient(),
            })
            .into_actor(self)
            .then(|_, _, _| ready(()))
            .wait(context);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        self.server_address.do_send(DisconnectRequest {
            session_id: self.session_id.clone(),
            page_id: self.page_id.clone(),
            project_id: self.project_id.clone(),
        });
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
                        Err(message) => {
                            let response: Response = ErrorInformationResponse::new(message).into();
                            logger::session_error(&self.session_id, &response.r#type, &response.json);
                            context.text(response.json)
                        }
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
    pub r#type: String,
    pub json: String,
}

impl Handler<Response> for Session {
    type Result = ();

    fn handle(&mut self, response: Response, context: &mut Self::Context) {
        context.text(response.json);
    }
}
