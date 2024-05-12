use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::{PageId, SessionId};
use crate::data::ObjectId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct UpdateIconRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub color: String,
    pub text: String,
}

impl UpdateIconRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<UpdateIconRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "object_id")?,
            color: parse_string(&json, "color")?,
            text: parse_string(&json, "text")?,
        })
    }
}

impl Handler<UpdateIconRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdateIconRequest, _: &mut Context<Self>) {
        println!("accept update-icon request");

        let response = UpdateIconResponse::new(request.object_id, request.color, request.text);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
pub struct UpdateIconResponse {
    r#type: String,
    object_id: ObjectId,
    color: String,
    text: String,
}

impl UpdateIconResponse {
    fn new(object_id: ObjectId, color: String, text: String) -> Self {
        Self { r#type: String::from("update-icon"), object_id, color, text }
    }
}

impl From<UpdateIconResponse> for Response {
    fn from(value: UpdateIconResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
