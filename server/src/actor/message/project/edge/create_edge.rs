use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::information::error_information::ErrorInformationResponse;
use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::project::ProjectId;
use crate::data::ObjectId;
use crate::db::store::project::project_edge_store;
use crate::logger;

pub const TYPE: &str = "create-edge";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct CreateEdgeRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
    pub object_type: String,
    pub source: ObjectId,
    pub target: ObjectId,
    pub source_handle: String,
    pub target_handle: String,
    pub arrow_type: String,
    pub label: String,
}

impl CreateEdgeRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<CreateEdgeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            object_type: parse_string(&json, "objectType")?,
            source: parse_string(&json, "source")?,
            target: parse_string(&json, "target")?,
            source_handle: parse_string(&json, "sourceHandle")?,
            target_handle: parse_string(&json, "targetHandle")?,
            arrow_type: parse_string(&json, "arrowType")?,
            label: parse_string(&json, "label")?,
        })
    }
}

impl Handler<CreateEdgeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: CreateEdgeRequest, _: &mut Context<Self>) {
        logger::accept(&"john".to_string(), TYPE, &request);

        let accept = || -> Result<CreateEdgeResponse, String> {
            project_edge_store::create_project_edge(
                &mut self.get_conn()?,
                &request.object_id,
                &request.project_id,
                &request.object_type,
                &request.source,
                &request.target,
                &request.source_handle,
                &request.target_handle,
                &request.arrow_type,
                &request.label,
            )
            .map_err(|e| e.show())?;

            Ok(CreateEdgeResponse::new(
                request.object_id,
                request.object_type,
                request.source,
                request.target,
                request.source_handle,
                request.target_handle,
                request.arrow_type,
                request.label,
            ))
        };

        match accept() {
            Ok(response) => self.send_to_project(&request.project_id, response, &request.session_id),
            Err(message) => self.send_to_self(ErrorInformationResponse::new(message), &request.session_id),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEdgeResponse {
    r#type: String,
    object_id: ObjectId,
    object_type: String,
    source: ObjectId,
    target: ObjectId,
    source_handle: String,
    target_handle: String,
    arrow_type: String,
    label: String,
}

impl CreateEdgeResponse {
    #[allow(clippy::too_many_arguments)]
    fn new(
        object_id: ObjectId,
        object_type: String,
        source: ObjectId,
        target: ObjectId,
        source_handle: String,
        target_handle: String,
        arrow_type: String,
        label: String,
    ) -> Self {
        Self {
            r#type: TYPE.to_string(),
            object_id,
            object_type,
            source,
            target,
            source_handle,
            target_handle,
            arrow_type,
            label,
        }
    }
}

impl From<CreateEdgeResponse> for Response {
    fn from(value: CreateEdgeResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
