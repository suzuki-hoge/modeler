use std::collections::HashMap;
use std::fs::File;
use std::io::Write;

use actix::{Actor, Context, Recipient};
use serde_json::{json, to_string as to_json_string};

use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::data::User;

pub struct Server {
    sessions: HashMap<SessionId, (Recipient<Response>, User)>,
    project_sessions: HashMap<ProjectId, Vec<SessionId>>,
    page_sessions: HashMap<PageId, Vec<SessionId>>,
}

impl Server {
    pub fn new() -> Self {
        Self { sessions: HashMap::new(), project_sessions: HashMap::new(), page_sessions: HashMap::new() }
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
        self.sessions.insert(session_id.clone(), (session_address, user));
        self.project_sessions.entry(project_id.clone()).or_default().push(session_id.clone());
        self.page_sessions.entry(page_id.clone()).or_default().push(session_id.clone());
    }

    pub fn disconnect(&mut self, session_id: SessionId, page_id: PageId, project_id: ProjectId) -> User {
        let (_, user) = self.sessions.remove(&session_id).unwrap();

        let project_sessions = self.project_sessions.entry(project_id.clone()).or_default();
        project_sessions.retain(|id| id != &session_id);
        if project_sessions.is_empty() {
            self.project_sessions.remove(&project_id);
        }

        let page_sessions = self.page_sessions.entry(page_id.clone()).or_default();
        page_sessions.retain(|id| id != &session_id);
        if page_sessions.is_empty() {
            self.page_sessions.remove(&project_id);
        }

        user
    }

    pub fn send_to_project(&self, project_id: &ProjectId, response: Response, skip_session_id: &SessionId) {
        println!("accept response: {}", &response.json);
        self.project_sessions.get(project_id).unwrap().iter().for_each(|session_id| {
            if session_id != skip_session_id {
                let (session_address, user) = self.sessions.get(session_id).unwrap();
                println!("send project message to: {}", user);
                session_address.do_send(response.clone());
            }
        });
        self.dump();
    }

    pub fn send_to_page(&self, page_id: &PageId, response: Response, skip_session_id: &SessionId) {
        println!("accept response: {}", &response.json);
        self.page_sessions.get(page_id).unwrap().iter().for_each(|session_id| {
            if session_id != skip_session_id {
                let (session_address, user) = self.sessions.get(session_id).unwrap();
                println!("send page message to: {}", user);
                session_address.do_send(response.clone());
            }
        });
        self.dump();
    }

    fn dump(&self) {
        let users: HashMap<SessionId, User> = self.sessions.iter().map(|(k, v)| (k.clone(), v.1.clone())).collect();

        let json = json!({
            "projectSessions": self.project_sessions,
            "pageSessions": self.page_sessions,
            "users": users
        });

        let mut file = File::create("/tmp/modeler-server.json").unwrap();
        file.write_all(to_json_string(&json).unwrap().as_bytes()).unwrap();
    }
}

impl Actor for Server {
    type Context = Context<Self>;
}
