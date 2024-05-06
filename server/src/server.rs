use std::collections::{HashMap, HashSet};

use crate::session::{NoticeRequest, SessionId};
use actix::{Actor, Context, Handler, Message as ActixMessage, Recipient};
use rand::{rngs::ThreadRng, Rng};

pub type PageId = String;

#[derive(ActixMessage)]
#[rtype(SessionId)]
pub struct ConnectRequest {
    pub session_address: Recipient<NoticeRequest>,
}

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct DisconnectRequest {
    pub requester: SessionId,
}

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct BroadcastRequest {
    pub requester: SessionId,
    pub message: String,
    pub page_id: PageId,
}

pub struct ChatServer {
    sessions: HashMap<SessionId, Recipient<NoticeRequest>>,
    pages: HashMap<PageId, HashSet<SessionId>>,
    rng: ThreadRng,
}

impl ChatServer {
    pub fn new() -> ChatServer {
        ChatServer { sessions: HashMap::new(), pages: HashMap::new(), rng: rand::thread_rng() }
    }
}

impl ChatServer {
    fn notice_to_session<S: Into<String>>(&self, page_id: &PageId, message: S, skip_session_id: Option<SessionId>) {
        let message = message.into();
        if let Some(session_ids) = self.pages.get(page_id) {
            for session_id in session_ids {
                if skip_session_id.is_some() && *session_id != skip_session_id.unwrap() {
                    if let Some(session_address) = self.sessions.get(session_id) {
                        println!("server: notice [ {} ] to {} in {}", &message, &session_id, page_id);
                        println!("server -> session");
                        session_address.do_send(NoticeRequest { kind: "test".to_string(), message: message.clone() });
                    }
                }
            }
        }
    }
}

impl Actor for ChatServer {
    type Context = Context<Self>;
}

impl Handler<ConnectRequest> for ChatServer {
    type Result = usize;

    fn handle(&mut self, request: ConnectRequest, _: &mut Context<Self>) -> Self::Result {
        let new_session_id = self.rng.gen::<SessionId>();
        self.sessions.insert(new_session_id, request.session_address);

        println!("server: connect request accepted [ {} ]", &new_session_id);

        self.pages.entry("main".to_owned()).or_default().insert(new_session_id);

        new_session_id
    }
}

impl Handler<DisconnectRequest> for ChatServer {
    type Result = ();

    fn handle(&mut self, request: DisconnectRequest, _: &mut Context<Self>) {
        println!("server: disconnect request accepted [ {} ]", &request.requester);

        self.sessions.remove(&request.requester);

        let mut disconnected_page_ids = vec![];

        for (page_id, sessions) in &mut self.pages {
            if sessions.remove(&request.requester) {
                disconnected_page_ids.push(page_id.clone());
            }
        }

        for page_id in disconnected_page_ids {
            self.notice_to_session(&page_id, format!("{} disconnected from {}", request.requester, &page_id), None);
        }
    }
}

impl Handler<BroadcastRequest> for ChatServer {
    type Result = ();

    fn handle(&mut self, request: BroadcastRequest, _: &mut Context<Self>) {
        println!("server: broadcast request accepted [ {} ]", &request.message);

        self.notice_to_session(&request.page_id, request.message, Some(request.requester));
    }
}
