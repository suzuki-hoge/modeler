use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, parse_usize, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::{PageId, SessionId};
use crate::data::ObjectId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct InsertPropertyRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub property: String,
    pub n: usize,
}

impl InsertPropertyRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<InsertPropertyRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            property: parse_string(&json, "property")?,
            n: parse_usize(&json, "n")?,
        })
    }
}

impl Handler<InsertPropertyRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: InsertPropertyRequest, _: &mut Context<Self>) {
        println!("accept insert-property request");

        let response = InsertPropertyResponse::new(request.object_id, request.property, request.n);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InsertPropertyResponse {
    r#type: String,
    object_id: ObjectId,
    property: String,
    n: usize,
}

impl InsertPropertyResponse {
    fn new(object_id: ObjectId, property: String, n: usize) -> Self {
        Self { r#type: String::from("insert-property"), object_id, property, n }
    }
}

impl From<InsertPropertyResponse> for Response {
    fn from(value: InsertPropertyResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
