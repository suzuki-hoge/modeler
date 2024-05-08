use std::collections::HashMap;

use actix::{Actor, Context, Handler, Message as ActixMessage, Recipient};

use crate::session::{NoticeRequest, SessionId};

pub type PageId = String;
pub type ObjectId = String;

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

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct LockRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
}

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct UnlockRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
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
        pr("connect", format!("by {} in {} [ {} ]", &request.session_id, &request.page_id, &request.page_id));

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
        pr("disconnect", format!("by {} in {} [ {} ]", &request.session_id, &request.page_id, &request.page_id));

        let sessions: &mut Sessions = self.pages.entry(request.page_id.clone()).or_default();
        sessions.remove(&request.session_id);

        self.notice_to_session(&request.page_id, NoticeRequest::disconnected(&request.session_id), None);
    }
}

impl Handler<BroadcastRequest> for ChatServer {
    type Result = ();

    fn handle(&mut self, request: BroadcastRequest, _: &mut Context<Self>) {
        pr("broadcast", format!("by {} in {} [ {} ]", &request.session_id, &request.page_id, &request.message));

        self.notice_to_session(&request.page_id, NoticeRequest::broadcast(&request.message), Some(&request.session_id));
    }
}

impl Handler<LockRequest> for ChatServer {
    type Result = ();

    fn handle(&mut self, request: LockRequest, _: &mut Context<Self>) {
        pr("lock", format!("by {} in {} [ {} ]", &request.session_id, &request.page_id, &request.object_id));

        self.notice_to_session(&request.page_id, NoticeRequest::lock(request.object_id), Some(&request.session_id));
    }
}

impl Handler<UnlockRequest> for ChatServer {
    type Result = ();

    fn handle(&mut self, request: UnlockRequest, _: &mut Context<Self>) {
        pr("unlock", format!("by {} in {} [ {} ]", &request.session_id, &request.page_id, &request.object_id));

        self.notice_to_session(&request.page_id, NoticeRequest::unlock(request.object_id), Some(&request.session_id));
    }
}

fn pr(kind: &str, s: String) {
    println!("server: {} request accepted {}", kind, s);
}
