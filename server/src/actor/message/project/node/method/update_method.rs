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
pub struct UpdateMethodRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub method: String,
    pub n: usize,
}

impl UpdateMethodRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<UpdateMethodRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            method: parse_string(&json, "method")?,
            n: parse_usize(&json, "n")?,
        })
    }
}

impl Handler<UpdateMethodRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdateMethodRequest, _: &mut Context<Self>) {
        println!("accept update-method request");

        let response = UpdateMethodResponse::new(request.object_id, request.method, request.n);
        self.send_to_project(&request.page_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMethodResponse {
    r#type: String,
    object_id: ObjectId,
    method: String,
    n: usize,
}

impl UpdateMethodResponse {
    fn new(object_id: ObjectId, method: String, n: usize) -> Self {
        Self { r#type: String::from("update-method"), object_id, method, n }
    }
}

impl From<UpdateMethodResponse> for Response {
    fn from(value: UpdateMethodResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
