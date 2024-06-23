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
pub struct AddEdgeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
}

impl AddEdgeRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<AddEdgeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
        })
    }
}

impl Handler<AddEdgeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: AddEdgeRequest, _: &mut Context<Self>) {
        println!("accept add-edge request");

        let response = AddEdgeResponse::new(request.object_id);
        self.send_to_page(&request.page_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddEdgeResponse {
    r#type: String,
    object_id: ObjectId,
}

impl AddEdgeResponse {
    fn new(object_id: ObjectId) -> Self {
        Self { r#type: String::from("add-edge"), object_id }
    }
}

impl From<AddEdgeResponse> for Response {
    fn from(value: AddEdgeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
