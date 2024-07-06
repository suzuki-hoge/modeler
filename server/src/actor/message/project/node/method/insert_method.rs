use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{Json, parse_string, parse_usize};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::ObjectId;
use crate::data::page::PageId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct InsertMethodRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub method: String,
    pub n: usize,
}

impl InsertMethodRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<InsertMethodRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            method: parse_string(&json, "method")?,
            n: parse_usize(&json, "n")?,
        })
    }
}

impl Handler<InsertMethodRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: InsertMethodRequest, _: &mut Context<Self>) {
        println!("accept insert-method request");

        let response = InsertMethodResponse::new(request.object_id, request.method, request.n);
        self.send_to_project(&request.page_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InsertMethodResponse {
    r#type: String,
    object_id: ObjectId,
    method: String,
    n: usize,
}

impl InsertMethodResponse {
    fn new(object_id: ObjectId, method: String, n: usize) -> Self {
        Self { r#type: String::from("insert-method"), object_id, method, n }
    }
}

impl From<InsertMethodResponse> for Response {
    fn from(value: InsertMethodResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
