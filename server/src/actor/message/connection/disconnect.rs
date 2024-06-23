use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::server::Server;
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
        let user = self.disconnect(request.session_id.clone(), request.page_id.clone());

        let response = DisconnectResponse::new(request.session_id.clone(), user);
        self.send_to_page(&request.page_id, response.into(), &request.session_id);
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
