use crate::actor::session::Response;
use crate::actor::{PageId, SessionId};
use crate::data::User;
use actix::{Actor, Context, Recipient};
use std::collections::HashMap;

pub type Sessions = HashMap<SessionId, Recipient<Response>>;

pub struct Server {
    pub pages: HashMap<PageId, Sessions>,
    pub users: HashMap<SessionId, User>,
}

impl Server {
    pub fn new() -> Self {
        Self { pages: HashMap::new(), users: HashMap::new() }
    }
}

impl Server {
    pub fn respond_to_session(&self, page_id: &PageId, response: Response, skip_session_id: Option<&SessionId>) {
        println!("accept response: {}", &response.json);
        if let Some(sessions) = self.pages.get(page_id) {
            for (session_id, session_address) in sessions {
                if Some(session_id) != skip_session_id {
                    println!("send to: {}", self.users.get(session_id).unwrap());
                    session_address.do_send(response.clone());
                }
            }
        }
    }
}

impl Actor for Server {
    type Context = Context<Self>;
}
