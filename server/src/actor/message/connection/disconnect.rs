use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::server::{Server, Sessions};
use crate::actor::session::Response;
use crate::actor::{PageId, SessionId};
use crate::data::User;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct DisconnectRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
}

impl Handler<DisconnectRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: DisconnectRequest, _: &mut Context<Self>) {
        println!("accept disconnect request");

        let sessions: &mut Sessions = self.pages.entry(request.page_id.clone()).or_default();
        sessions.remove(&request.session_id);

        let user = self.users.remove(&request.session_id).unwrap();

        let response = DisconnectResponse::new(request.session_id.clone(), user);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DisconnectResponse {
    r#type: String,
    session_id: SessionId,
    user: User,
}

impl DisconnectResponse {
    fn new(session_id: SessionId, user: User) -> Self {
        Self { r#type: String::from("disconnect"), session_id, user }
    }
}

impl From<DisconnectResponse> for Response {
    fn from(value: DisconnectResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
