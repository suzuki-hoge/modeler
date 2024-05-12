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
pub struct AddMethodRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub method: String,
    pub n: usize,
}

impl AddMethodRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<AddMethodRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "object_id")?,
            method: parse_string(&json, "method")?,
            n: parse_usize(&json, "n")?,
        })
    }
}

impl Handler<AddMethodRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: AddMethodRequest, _: &mut Context<Self>) {
        println!("accept add-method request");

        let response = AddMethodResponse::new(request.object_id, request.method, request.n);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
pub struct AddMethodResponse {
    r#type: String,
    object_id: ObjectId,
    method: String,
    n: usize,
}

impl AddMethodResponse {
    fn new(object_id: ObjectId, method: String, n: usize) -> Self {
        Self { r#type: String::from("add-method"), object_id, method, n }
    }
}

impl From<AddMethodResponse> for Response {
    fn from(value: AddMethodResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
