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
pub struct CreateEdgeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub src: ObjectId,
    pub dst: ObjectId,
    pub arrow_type: String,
    pub label: String,
}

impl CreateEdgeRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<CreateEdgeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            src: parse_string(&json, "src")?,
            dst: parse_string(&json, "dst")?,
            arrow_type: parse_string(&json, "arrowType")?,
            label: parse_string(&json, "label")?,
        })
    }
}

impl Handler<CreateEdgeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: CreateEdgeRequest, _: &mut Context<Self>) {
        println!("accept create-edge request");

        let response =
            CreateEdgeResponse::new(request.object_id, request.src, request.dst, request.arrow_type, request.label);
        self.send_to_project(&request.page_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEdgeResponse {
    r#type: String,
    object_id: ObjectId,
    src: ObjectId,
    dst: ObjectId,
    arrow_type: String,
    label: String,
}

impl CreateEdgeResponse {
    fn new(object_id: ObjectId, src: ObjectId, dst: ObjectId, arrow_type: String, label: String) -> Self {
        Self { r#type: String::from("create-edge"), object_id, src, dst, arrow_type, label }
    }
}

impl From<CreateEdgeResponse> for Response {
    fn from(value: CreateEdgeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
