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
    pub src: ObjectId,
    pub dst: ObjectId,
}

impl AddEdgeRequest {
    pub fn parse(session_id: SessionId, page_id: PageId, map: Json) -> Result<AddEdgeRequest, String> {
        Ok(Self {
            session_id,
            page_id,
            object_id: parse_string(&map, "object_id")?,
            src: parse_string(&map, "src")?,
            dst: parse_string(&map, "dst")?,
        })
    }
}

impl Handler<AddEdgeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: AddEdgeRequest, _: &mut Context<Self>) {
        println!("accept add-edge request");

        let response = AddEdgeResponse::new(request.object_id, request.src, request.dst);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
pub struct AddEdgeResponse {
    r#type: String,
    object_id: ObjectId,
    pub src: ObjectId,
    pub dst: ObjectId,
}

impl AddEdgeResponse {
    fn new(object_id: ObjectId, src: ObjectId, dst: ObjectId) -> Self {
        Self { r#type: String::from("add-edge"), object_id, src, dst }
    }
}

impl From<AddEdgeResponse> for Response {
    fn from(value: AddEdgeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
