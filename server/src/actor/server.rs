use std::collections::HashMap;

use actix::{Actor, Context, Recipient};

use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::User;
use crate::data::page::PageId;
use crate::data::project::ProjectId;

pub type Sessions = HashMap<SessionId, Recipient<Response>>;

pub struct Server {
    pages: HashMap<PageId, Sessions>,
    projects: HashMap<PageId, ProjectId>,
    users: HashMap<SessionId, User>,
}

impl Server {
    pub fn new() -> Self {
        Self { pages: HashMap::new(), projects: HashMap::new(), users: HashMap::new() }
    }
}

impl Server {
    pub fn connect(
        &mut self,
        session_id: SessionId,
        user: User,
        project_id: ProjectId,
        page_id: PageId,
        session_address: Recipient<Response>,
    ) {
        let sessions: &mut Sessions = self.pages.entry(page_id.clone()).or_default();
        sessions.insert(session_id.clone(), session_address);

        self.projects.insert(page_id, project_id);
        self.users.insert(session_id, user);
    }

    pub fn disconnect(&mut self, session_id: SessionId, page_id: PageId) -> User {
        let sessions: &mut Sessions = self.pages.entry(page_id.clone()).or_default();
        sessions.remove(&session_id);

        self.projects.remove(&page_id).unwrap();
        self.users.remove(&session_id).unwrap()
    }

    pub fn send_to_page(&self, page_id: &PageId, response: Response, skip_session_id: &SessionId) {
        println!("accept response: {}", &response.json);
        if let Some(sessions) = self.pages.get(page_id) {
            for (session_id, session_address) in sessions {
                if session_id != skip_session_id {
                    println!("send to: {}", self.users.get(session_id).unwrap());
                    session_address.do_send(response.clone());
                }
            }
        }
    }

    pub fn send_to_project(&self, dst_project_id: &ProjectId, response: Response, skip_session_id: &SessionId) {
        println!("accept response: {}", &response.json);
        for (page_id, project_id) in self.projects.iter() {
            if project_id == dst_project_id {
                self.send_to_page(page_id, response.clone(), skip_session_id);
            }
        }
    }
}

impl Actor for Server {
    type Context = Context<Self>;
}
