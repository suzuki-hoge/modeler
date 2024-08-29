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

pub const TYPE: &str = "delete-edge";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct DeleteEdgeRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
}

impl DeleteEdgeRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<DeleteEdgeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
        })
    }
}

impl Handler<DeleteEdgeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: DeleteEdgeRequest, _: &mut Context<Self>) {
        logger::accept(&request.session_id, TYPE, &request);

        let accept = || -> Result<DeleteEdgeResponse, String> {
            project_edge_store::delete(&mut self.get_conn()?, &request.object_id)?;

            Ok(DeleteEdgeResponse::new(request.object_id))
        };

        match accept() {
            Ok(response) => self.send_to_project(&request.project_id, response, &request.session_id),
            Err(message) => self.send_to_self(ErrorInformationResponse::new(message), &request.session_id),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteEdgeResponse {
    r#type: String,
    object_id: ObjectId,
}

impl DeleteEdgeResponse {
    fn new(object_id: ObjectId) -> Self {
        Self { r#type: TYPE.to_string(), object_id }
    }
}

impl From<DeleteEdgeResponse> for Response {
    fn from(value: DeleteEdgeResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
