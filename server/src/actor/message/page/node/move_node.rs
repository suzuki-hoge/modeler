use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{Json, parse_f64, parse_string};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::ObjectId;
use crate::data::page::PageId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct MoveNodeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub x: f64,
    pub y: f64,
}

impl MoveNodeRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<MoveNodeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            x: parse_f64(&json, "x")?,
            y: parse_f64(&json, "y")?,
        })
    }
}

impl Handler<MoveNodeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: MoveNodeRequest, _: &mut Context<Self>) {
        println!("accept move-node request");

        let response = MoveNodeResponse::new(request.object_id, request.x, request.y);
        self.send_to_page(&request.page_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MoveNodeResponse {
    r#type: String,
    object_id: ObjectId,
    x: f64,
    y: f64,
}

impl MoveNodeResponse {
    fn new(object_id: ObjectId, x: f64, y: f64) -> Self {
        Self { r#type: String::from("move-node"), object_id, x, y }
    }
}

impl From<MoveNodeResponse> for Response {
    fn from(value: MoveNodeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
