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
pub struct DeleteMethodRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub n: usize,
}

impl DeleteMethodRequest {
    pub fn parse(session_id: SessionId, page_id: PageId, map: HashMap<String, Value>) -> Result<Self, String> {
        Ok(Self {
            session_id,
            page_id,
            object_id: map.get("object_id").unwrap().as_str().unwrap().to_string(),
            n: map.get("n").unwrap().as_u64().unwrap() as usize,
        })
    }
}

impl Handler<DeleteMethodRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: DeleteMethodRequest, _: &mut Context<Self>) {
        println!("accept delete-method request");

        let response = DeleteMethodResponse::new(request.object_id, request.n);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
pub struct DeleteMethodResponse {
    r#type: String,
    object_id: ObjectId,
    pub n: usize,
}

impl DeleteMethodResponse {
    fn new(object_id: ObjectId, n: usize) -> Self {
        Self { r#type: String::from("delete-method"), object_id, n }
    }
}

impl From<DeleteMethodResponse> for Response {
    fn from(value: DeleteMethodResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
