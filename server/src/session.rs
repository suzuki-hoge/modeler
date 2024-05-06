use std::time::{Duration, Instant};

use actix::{
    fut::ready, Actor, ActorContext, ActorFutureExt, Addr, AsyncContext, ContextFutureSpawner, Handler,
    Message as ActixMessage, Running, StreamHandler, WrapFuture,
};
use actix_web_actors::ws::{Message as WsMessage, ProtocolError, WebsocketContext};

use crate::server::{BroadcastRequest, ChatServer, ConnectRequest, DisconnectRequest, PageId};

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

pub type SessionId = usize;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct NoticeRequest(pub String);

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

    fn handle(&mut self, message: NoticeRequest, context: &mut Self::Context) {
        println!("session: notice request accepted, send [ {} ] to {}", &message.0, &self.id);
        context.text(message.0);
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
                WsMessage::Text(text) => {
                    let message = text.trim().to_string();
                    println!("session: receive text [ {} ]", &message);
                    println!("session -> server");
                    self.server_address.do_send(BroadcastRequest {
                        requester: self.id,
                        message,
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
