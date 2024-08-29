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
use crate::db::store::project::project_node_store;
use crate::logger;

pub const TYPE: &str = "delete-node";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct DeleteNodeRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
}

impl DeleteNodeRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<DeleteNodeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
        })
    }
}

impl Handler<DeleteNodeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: DeleteNodeRequest, _: &mut Context<Self>) {
        logger::accept(&request.session_id, TYPE, &request);

        let accept = || -> Result<DeleteNodeResponse, String> {
            project_node_store::delete(&mut self.get_conn()?, &request.object_id)?;

            Ok(DeleteNodeResponse::new(request.object_id))
        };

        match accept() {
            Ok(response) => self.send_to_project(&request.project_id, response, &request.session_id),
            Err(message) => self.send_to_self(ErrorInformationResponse::new(message), &request.session_id),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteNodeResponse {
    r#type: String,
    object_id: ObjectId,
}

impl DeleteNodeResponse {
    fn new(object_id: ObjectId) -> Self {
        Self { r#type: TYPE.to_string(), object_id }
    }
}

impl From<DeleteNodeResponse> for Response {
    fn from(value: DeleteNodeResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
