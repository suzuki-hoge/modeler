use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_f64, parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::{PageId, SessionId};
use crate::data::ObjectId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct AddNodeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub x: f64,
    pub y: f64,
}

impl AddNodeRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<AddNodeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            x: parse_f64(&json, "x")?,
            y: parse_f64(&json, "y")?,
        })
    }
}

impl Handler<AddNodeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: AddNodeRequest, _: &mut Context<Self>) {
        println!("accept add-node request");

        let response = AddNodeResponse::new(request.object_id, request.x, request.y);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddNodeResponse {
    r#type: String,
    object_id: ObjectId,
    x: f64,
    y: f64,
}

impl AddNodeResponse {
    fn new(object_id: ObjectId, x: f64, y: f64) -> Self {
        Self { r#type: String::from("add-node"), object_id, x, y }
    }
}

impl From<AddNodeResponse> for Response {
    fn from(value: AddNodeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
