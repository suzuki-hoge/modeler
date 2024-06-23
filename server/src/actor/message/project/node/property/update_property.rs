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
pub struct UpdatePropertyRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub property: String,
    pub n: usize,
}

impl UpdatePropertyRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<UpdatePropertyRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            property: parse_string(&json, "property")?,
            n: parse_usize(&json, "n")?,
        })
    }
}

impl Handler<UpdatePropertyRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdatePropertyRequest, _: &mut Context<Self>) {
        println!("accept update-property request");

        let response = UpdatePropertyResponse::new(request.object_id, request.property, request.n);
        self.send_to_project(&request.page_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePropertyResponse {
    r#type: String,
    object_id: ObjectId,
    property: String,
    n: usize,
}

impl UpdatePropertyResponse {
    fn new(object_id: ObjectId, property: String, n: usize) -> Self {
        Self { r#type: String::from("update-property"), object_id, property, n }
    }
}

impl From<UpdatePropertyResponse> for Response {
    fn from(value: UpdatePropertyResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
