use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, parse_strings, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::page::PageId;
use crate::data::ObjectId;
use crate::data::project::ProjectId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct UpdatePropertiesRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
    pub properties: Vec<String>,
}

impl UpdatePropertiesRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<UpdatePropertiesRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            properties: parse_strings(&json, "properties")?,
        })
    }
}

impl Handler<UpdatePropertiesRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdatePropertiesRequest, _: &mut Context<Self>) {
        println!("accept update-properties request");

        let response = UpdatePropertiesResponse::new(request.object_id, request.properties);
        self.send_to_project(&request.project_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePropertiesResponse {
    r#type: String,
    object_id: ObjectId,
    properties: Vec<String>,
}

impl UpdatePropertiesResponse {
    fn new(object_id: ObjectId, properties: Vec<String>) -> Self {
        Self { r#type: String::from("update-properties"), object_id, properties }
    }
}

impl From<UpdatePropertiesResponse> for Response {
    fn from(value: UpdatePropertiesResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
