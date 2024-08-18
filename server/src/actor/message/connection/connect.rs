use actix::{Context, Handler, Message as ActixMessage, Recipient};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::data::user::UserId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct ConnectRequest {
    pub session_id: SessionId,
    pub user_id: UserId,
    pub project_id: ProjectId,
    pub page_id: PageId,
    pub session_address: Recipient<Response>,
}

impl Handler<ConnectRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: ConnectRequest, _: &mut Context<Self>) {
        println!("accept connect request");

        self.connect(
            request.session_id.clone(),
            request.user_id.clone(),
            request.project_id.clone(),
            request.page_id.clone(),
            request.session_address,
        );

        let response = ConnectResponse::new(request.session_id.clone(), request.user_id);

        self.send_to_page(&request.page_id, Ok(response), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectResponse {
    r#type: String,
    session_id: SessionId,
    user_id: UserId,
}

impl ConnectResponse {
    fn new(session_id: SessionId, user_id: UserId) -> Self {
        Self { r#type: String::from("connect"), session_id, user_id }
    }
}

impl From<ConnectResponse> for Response {
    fn from(value: ConnectResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
