use std::collections::HashMap;

use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::{to_string as to_json_string, Value};

use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::{PageId, SessionId};
use crate::data::ObjectId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct AddNodeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub x: u64,
    pub y: u64,
}

impl AddNodeRequest {
    pub fn parse(session_id: SessionId, page_id: PageId, map: HashMap<String, Value>) -> Result<Self, String> {
        Ok(Self {
            session_id,
            page_id,
            x: map.get("x").unwrap().as_u64().unwrap(),
            y: map.get("y").unwrap().as_u64().unwrap(),
        })
    }
}

impl Handler<AddNodeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: AddNodeRequest, _: &mut Context<Self>) {
        println!("accept add-node request");

        let object_id = "new-node-1".to_string();

        let response = AddNodeResponse::new(object_id, request.x, request.y);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
pub struct AddNodeResponse {
    r#type: String,
    object_id: ObjectId,
    pub x: u64,
    pub y: u64,
}

impl AddNodeResponse {
    fn new(object_id: ObjectId, x: u64, y: u64) -> Self {
        Self { r#type: String::from("add-node"), object_id, x, y }
    }
}

impl From<AddNodeResponse> for Response {
    fn from(value: AddNodeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
