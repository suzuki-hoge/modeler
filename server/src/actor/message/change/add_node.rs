use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_i64, parse_string, Json};
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
    pub x: i64,
    pub y: i64,
}

impl AddNodeRequest {
    pub fn parse(session_id: SessionId, page_id: PageId, map: Json) -> Result<AddNodeRequest, String> {
        Ok(Self {
            session_id,
            page_id,
            object_id: parse_string(&map, "object_id")?,
            x: parse_i64(&map, "x")?,
            y: parse_i64(&map, "y")?,
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
pub struct AddNodeResponse {
    r#type: String,
    object_id: ObjectId,
    pub x: i64,
    pub y: i64,
}

impl AddNodeResponse {
    fn new(object_id: ObjectId, x: i64, y: i64) -> Self {
        Self { r#type: String::from("add-node"), object_id, x, y }
    }
}

impl From<AddNodeResponse> for Response {
    fn from(value: AddNodeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
