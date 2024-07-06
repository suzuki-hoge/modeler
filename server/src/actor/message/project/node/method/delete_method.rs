use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, parse_usize, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::page::PageId;
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
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<DeleteMethodRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            n: parse_usize(&json, "n")?,
        })
    }
}

impl Handler<DeleteMethodRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: DeleteMethodRequest, _: &mut Context<Self>) {
        println!("accept delete-method request");

        let response = DeleteMethodResponse::new(request.object_id, request.n);
        self.send_to_project(&request.page_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteMethodResponse {
    r#type: String,
    object_id: ObjectId,
    n: usize,
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
