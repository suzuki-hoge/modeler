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
pub struct AddPropertyRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub property: String,
    pub n: usize,
}

impl AddPropertyRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<AddPropertyRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "object_id")?,
            property: parse_string(&json, "property")?,
            n: parse_usize(&json, "n")?,
        })
    }
}

impl Handler<AddPropertyRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: AddPropertyRequest, _: &mut Context<Self>) {
        println!("accept add-property request");

        let response = AddPropertyResponse::new(request.object_id, request.property, request.n);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
pub struct AddPropertyResponse {
    r#type: String,
    object_id: ObjectId,
    property: String,
    n: usize,
}

impl AddPropertyResponse {
    fn new(object_id: ObjectId, property: String, n: usize) -> Self {
        Self { r#type: String::from("add-property"), object_id, property, n }
    }
}

impl From<AddPropertyResponse> for Response {
    fn from(value: AddPropertyResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
