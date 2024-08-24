use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::data::user::UserId;
use crate::logger;

pub const TYPE: &str = "disconnect";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct DisconnectRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub project_id: ProjectId,
}

impl Handler<DisconnectRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: DisconnectRequest, _: &mut Context<Self>) {
        logger::accept("john".to_string(), TYPE, &request);

        let user_id = self.disconnect(request.session_id.clone(), request.page_id.clone(), request.project_id.clone());

        let response = DisconnectResponse::new(request.session_id.clone(), user_id);

        self.send_to_page(&request.page_id, Ok(response), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DisconnectResponse {
    r#type: String,
    session_id: SessionId,
    user_id: UserId,
}

impl DisconnectResponse {
    fn new(session_id: SessionId, user_id: UserId) -> Self {
        Self { r#type: TYPE.to_string(), session_id, user_id }
    }
}

impl From<DisconnectResponse> for Response {
    fn from(value: DisconnectResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
