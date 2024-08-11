use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::project::ProjectId;
use crate::data::ObjectId;
use crate::db::store::project::project_edge_store;

#[derive(ActixMessage)]
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
        println!("accept delete-edge request");

        project_edge_store::delete_project_edge(&mut self.pool.get().unwrap(), &request.object_id).unwrap();

        let response = DeleteEdgeResponse::new(request.object_id);
        self.send_to_project(&request.project_id, response.into(), &request.session_id);
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
        Self { r#type: String::from("delete-edge"), object_id }
    }
}

impl From<DeleteEdgeResponse> for Response {
    fn from(value: DeleteEdgeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
