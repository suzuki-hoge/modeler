use std::collections::HashMap;
use std::fs::File;
use std::io::Write;

use actix::{Actor, Context, Recipient};
use serde_json::{json, to_string as to_json_string};

use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::data::user::UserId;
use crate::db::{Conn, Pool};
use crate::logger;

pub struct Server {
    pool: Pool,
    sessions: HashMap<SessionId, (Recipient<Response>, UserId)>,
    project_sessions: HashMap<ProjectId, Vec<SessionId>>,
    page_sessions: HashMap<PageId, Vec<SessionId>>,
}

impl Server {
    pub fn new(pool: Pool) -> Self {
        let server =
            Self { pool, sessions: HashMap::new(), project_sessions: HashMap::new(), page_sessions: HashMap::new() };
        server.dump();
        server
    }

    pub fn get_conn(&self) -> Result<Conn, String> {
        self.pool.get().map_err(|_| String::from("connection error"))
    }
}

impl Server {
    pub fn connect(
        &mut self,
        session_id: SessionId,
        user_id: UserId,
        project_id: ProjectId,
        page_id: PageId,
        session_address: Recipient<Response>,
    ) {
        self.sessions.insert(session_id.clone(), (session_address, user_id));
        self.project_sessions.entry(project_id.clone()).or_default().push(session_id.clone());
        self.page_sessions.entry(page_id.clone()).or_default().push(session_id.clone());
    }

    pub fn disconnect(&mut self, session_id: SessionId, page_id: PageId, project_id: ProjectId) -> UserId {
        let (_, user_id) = self.sessions.remove(&session_id).unwrap();

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

        user_id
    }

    pub fn send_to_project<R: Into<Response>>(&self, project_id: &ProjectId, response: R, skip: &SessionId) {
        self.send_to_sessions(response.into(), self.project_sessions.get(project_id).unwrap(), skip);
    }

    pub fn send_to_page<R: Into<Response>>(&self, page_id: &PageId, response: R, skip: &SessionId) {
        self.send_to_sessions(response.into(), self.page_sessions.get(page_id).unwrap(), skip);
    }

    pub fn send_to_self<R: Into<Response>>(&self, response: R, self_session_id: &SessionId) {
        let response: Response = response.into();
        let (session_address, _) = self.sessions.get(self_session_id).unwrap();
        logger::information(&"john".to_string(), &response.r#type, &response.json);
        session_address.do_send(response);
    }

    fn send_to_sessions(&self, response: Response, session_ids: &[SessionId], skip: &SessionId) {
        session_ids.iter().filter(|&session_id| session_id != skip).for_each(|session_id| {
            let (session_address, _) = self.sessions.get(session_id).unwrap();
            logger::broadcast(&"john".to_string(), &response.r#type, session_id, &response.json);
            session_address.do_send(response.clone());
        });

        self.dump();
    }

    fn dump(&self) {
        let users: HashMap<SessionId, UserId> = self.sessions.iter().map(|(k, v)| (k.clone(), v.1.clone())).collect();

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
