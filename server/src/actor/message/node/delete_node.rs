use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::{PageId, SessionId};
use crate::data::ObjectId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct DeleteNodeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
}

impl DeleteNodeRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<DeleteNodeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
        })
    }
}

impl Handler<DeleteNodeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: DeleteNodeRequest, _: &mut Context<Self>) {
        println!("accept delete-node request");

        let response = DeleteNodeResponse::new(request.object_id);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteNodeResponse {
    r#type: String,
    object_id: ObjectId,
}

impl DeleteNodeResponse {
    fn new(object_id: ObjectId) -> Self {
        Self { r#type: String::from("delete-node"), object_id }
    }
}

impl From<DeleteNodeResponse> for Response {
    fn from(value: DeleteNodeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
