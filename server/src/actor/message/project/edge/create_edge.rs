use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::project::ProjectId;
use crate::data::ObjectId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct CreateEdgeRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
    pub source: ObjectId,
    pub target: ObjectId,
    pub arrow_type: String,
    pub label: String,
}

impl CreateEdgeRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<CreateEdgeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            source: parse_string(&json, "source")?,
            target: parse_string(&json, "target")?,
            arrow_type: parse_string(&json, "arrowType")?,
            label: parse_string(&json, "label")?,
        })
    }
}

impl Handler<CreateEdgeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: CreateEdgeRequest, _: &mut Context<Self>) {
        println!("accept create-edge request");

        let response = CreateEdgeResponse::new(
            request.object_id,
            request.source,
            request.target,
            request.arrow_type,
            request.label,
        );
        self.send_to_project(&request.project_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEdgeResponse {
    r#type: String,
    object_id: ObjectId,
    source: ObjectId,
    target: ObjectId,
    arrow_type: String,
    label: String,
}

impl CreateEdgeResponse {
    fn new(object_id: ObjectId, source: ObjectId, target: ObjectId, arrow_type: String, label: String) -> Self {
        Self { r#type: String::from("create-edge"), object_id, source, target, arrow_type, label }
    }
}

impl From<CreateEdgeResponse> for Response {
    fn from(value: CreateEdgeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
