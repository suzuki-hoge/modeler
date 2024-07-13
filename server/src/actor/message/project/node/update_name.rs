use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::page::PageId;
use crate::data::ObjectId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct UpdateNameRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub name: String,
}

impl UpdateNameRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<UpdateNameRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            name: parse_string(&json, "name")?,
        })
    }
}

impl Handler<UpdateNameRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdateNameRequest, _: &mut Context<Self>) {
        println!("accept update-name request");

        let response = UpdateNameResponse::new(request.object_id, request.name);
        self.send_to_project(&request.page_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateNameResponse {
    r#type: String,
    object_id: ObjectId,
    name: String,
}

impl UpdateNameResponse {
    fn new(object_id: ObjectId, name: String) -> Self {
        Self { r#type: String::from("update-name"), object_id, name }
    }
}

impl From<UpdateNameResponse> for Response {
    fn from(value: UpdateNameResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
