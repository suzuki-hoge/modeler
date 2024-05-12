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
pub struct DeletePropertyRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub n: usize,
}

impl DeletePropertyRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<DeletePropertyRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "object_id")?,
            n: parse_usize(&json, "n")?,
        })
    }
}

impl Handler<DeletePropertyRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: DeletePropertyRequest, _: &mut Context<Self>) {
        println!("accept delete-property request");

        let response = DeletePropertyResponse::new(request.object_id, request.n);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
pub struct DeletePropertyResponse {
    r#type: String,
    object_id: ObjectId,
    n: usize,
}

impl DeletePropertyResponse {
    fn new(object_id: ObjectId, n: usize) -> Self {
        Self { r#type: String::from("delete-property"), object_id, n }
    }
}

impl From<DeletePropertyResponse> for Response {
    fn from(value: DeletePropertyResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
