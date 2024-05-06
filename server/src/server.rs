use std::collections::HashMap;

use actix::{Actor, Context, Handler, Message as ActixMessage, Recipient};

use crate::session::{NoticeRequest, SessionId};

pub type PageId = String;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct ConnectRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub session_address: Recipient<NoticeRequest>,
}

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct DisconnectRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
}

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct BroadcastRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub message: String,
}

type Sessions = HashMap<SessionId, Recipient<NoticeRequest>>;

pub struct ChatServer {
    pages: HashMap<PageId, Sessions>,
}

impl ChatServer {
    pub fn new() -> ChatServer {
        ChatServer { pages: HashMap::new() }
    }
}

impl ChatServer {
    fn notice_to_session(&self, page_id: &PageId, request: NoticeRequest, skip_session_id: Option<&SessionId>) {
        if let Some(sessions) = self.pages.get(page_id) {
            for (session_id, session_address) in sessions {
                if Some(session_id) != skip_session_id {
                    session_address.do_send(request.clone());
                }
            }
        }
    }
}

impl Actor for ChatServer {
    type Context = Context<Self>;
}

impl Handler<ConnectRequest> for ChatServer {
    type Result = ();

    fn handle(&mut self, request: ConnectRequest, _: &mut Context<Self>) -> Self::Result {
        println!("server: connect request accepted by {} in {}", &request.session_id, &request.page_id);

        let sessions: &mut Sessions = self.pages.entry(request.page_id.clone()).or_default();
        sessions.insert(request.session_id.clone(), request.session_address);

        self.notice_to_session(
            &request.page_id,
            NoticeRequest::connected(&request.session_id),
            Some(&request.session_id),
        );
    }
}

impl Handler<DisconnectRequest> for ChatServer {
    type Result = ();

    fn handle(&mut self, request: DisconnectRequest, _: &mut Context<Self>) {
        println!("server: disconnect request accepted by {} in {}", &request.session_id, &request.page_id);

        let sessions: &mut Sessions = self.pages.entry(request.page_id.clone()).or_default();
        sessions.remove(&request.session_id);

        self.notice_to_session(&request.page_id, NoticeRequest::disconnected(&request.session_id), None);
    }
}

impl Handler<BroadcastRequest> for ChatServer {
    type Result = ();

    fn handle(&mut self, request: BroadcastRequest, _: &mut Context<Self>) {
        println!(
            "server: broadcast request accepted by {} in {} [ {} ]",
            &request.session_id, &request.page_id, &request.message
        );

        self.notice_to_session(&request.page_id, NoticeRequest::broadcast(&request.message), Some(&request.session_id));
    }
}
