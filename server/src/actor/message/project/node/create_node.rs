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
pub struct CreateNodeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub icon_id: String,
    pub name: String,
}

impl CreateNodeRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<CreateNodeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            icon_id: parse_string(&json, "iconId")?,
            name: parse_string(&json, "name")?,
        })
    }
}

impl Handler<CreateNodeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: CreateNodeRequest, _: &mut Context<Self>) {
        println!("accept create-node request");

        let response = CreateNodeResponse::new(request.object_id, request.icon_id, request.name);
        self.send_to_project(&request.page_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateNodeResponse {
    r#type: String,
    object_id: ObjectId,
    icon_id: String,
    name: String,
}

impl CreateNodeResponse {
    fn new(object_id: ObjectId, icon_id: String, name: String) -> Self {
        Self { r#type: String::from("create-node"), object_id, icon_id, name }
    }
}

impl From<CreateNodeResponse> for Response {
    fn from(value: CreateNodeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
