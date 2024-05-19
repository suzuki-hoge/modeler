use actix::{Context, Handler, Message as ActixMessage, Recipient};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::server::{Server, Sessions};
use crate::actor::session::Response;
use crate::actor::{PageId, SessionId};
use crate::data::User;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct ConnectRequest {
    pub session_id: SessionId,
    pub user: User,
    pub page_id: PageId,
    pub session_address: Recipient<Response>,
}

impl Handler<ConnectRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: ConnectRequest, _: &mut Context<Self>) {
        println!("accept connect request");
        let sessions: &mut Sessions = self.pages.entry(request.page_id.clone()).or_default();
        sessions.insert(request.session_id.clone(), request.session_address);

        self.users.insert(request.session_id.clone(), request.user.clone());

        let response = ConnectResponse::new(request.session_id.clone(), request.user);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectResponse {
    r#type: String,
    session_id: SessionId,
    user: User,
}

impl ConnectResponse {
    fn new(session_id: SessionId, user: User) -> Self {
        Self { r#type: String::from("connect"), session_id, user }
    }
}

impl From<ConnectResponse> for Response {
    fn from(value: ConnectResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
