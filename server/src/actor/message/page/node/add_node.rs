use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_f64, parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::page::PageId;
use crate::data::ObjectId;
use crate::db::store::page::page_node_store;
use crate::logger;

pub const TYPE: &str = "add-node";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct AddNodeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub object_type: String,
    pub x: f64,
    pub y: f64,
}

impl AddNodeRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<AddNodeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            object_type: parse_string(&json, "objectType")?,
            x: parse_f64(&json, "x")?,
            y: parse_f64(&json, "y")?,
        })
    }
}

impl Handler<AddNodeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: AddNodeRequest, _: &mut Context<Self>) {
        logger::accept(&"john".to_string(), TYPE, &request);

        let accept = || -> Result<AddNodeResponse, String> {
            page_node_store::create_page_node(
                &mut self.get_conn()?,
                &request.object_id,
                &request.page_id,
                &request.object_type,
                request.x,
                request.y,
            )
            .map_err(|e| e.show())?;

            Ok(AddNodeResponse::new(request.object_id, request.object_type, request.x, request.y))
        };

        match accept() {
            Ok(response) => self.send_to_page(&request.page_id, response, &request.session_id),
            Err(message) => self.send_to_self(message, &request.session_id),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddNodeResponse {
    r#type: String,
    object_id: ObjectId,
    object_type: String,
    x: f64,
    y: f64,
}

impl AddNodeResponse {
    fn new(object_id: ObjectId, object_type: String, x: f64, y: f64) -> Self {
        Self { r#type: TYPE.to_string(), object_id, object_type, x, y }
    }
}

impl From<AddNodeResponse> for Response {
    fn from(value: AddNodeResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
