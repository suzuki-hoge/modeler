use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::page::PageId;
use crate::data::ObjectId;
use crate::data::project::ProjectId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct UpdateLabelRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
    pub label: String,
}

impl UpdateLabelRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<UpdateLabelRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            label: parse_string(&json, "label")?,
        })
    }
}

impl Handler<UpdateLabelRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdateLabelRequest, _: &mut Context<Self>) {
        println!("accept update-label request");

        let response = UpdateLabelResponse::new(request.object_id, request.label);
        self.send_to_project(&request.project_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateLabelResponse {
    r#type: String,
    object_id: ObjectId,
    label: String,
}

impl UpdateLabelResponse {
    fn new(object_id: ObjectId, label: String) -> Self {
        Self { r#type: String::from("update-label"), object_id, label }
    }
}

impl From<UpdateLabelResponse> for Response {
    fn from(value: UpdateLabelResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
