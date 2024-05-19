use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_strings, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::{PageId, SessionId};
use crate::data::ObjectId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct LockRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_ids: Vec<ObjectId>,
}

impl LockRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<LockRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_ids: parse_strings(&json, "objectIds")?,
        })
    }
}

impl Handler<LockRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: LockRequest, _: &mut Context<Self>) {
        println!("accept lock request");

        let response = LockResponse::new(request.object_ids);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LockResponse {
    r#type: String,
    object_ids: Vec<ObjectId>,
}

impl LockResponse {
    fn new(object_ids: Vec<ObjectId>) -> Self {
        Self { r#type: String::from("lock"), object_ids }
    }
}

impl From<LockResponse> for Response {
    fn from(value: LockResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
