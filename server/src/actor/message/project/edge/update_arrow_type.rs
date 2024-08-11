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
pub struct UpdateArrowTypeRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
    pub arrow_type: String,
}

impl UpdateArrowTypeRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<UpdateArrowTypeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            arrow_type: parse_string(&json, "arrowType")?,
        })
    }
}

impl Handler<UpdateArrowTypeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdateArrowTypeRequest, _: &mut Context<Self>) {
        println!("accept update-arrow-type request");

        project_edge_store::update_project_edge_arrow_type(
            &mut self.pool.get().unwrap(),
            &request.object_id,
            &request.arrow_type,
        )
        .unwrap();

        let response = UpdateArrowTypeResponse::new(request.object_id, request.arrow_type);
        self.send_to_project(&request.project_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateArrowTypeResponse {
    r#type: String,
    object_id: ObjectId,
    arrow_type: String,
}

impl UpdateArrowTypeResponse {
    fn new(object_id: ObjectId, arrow_type: String) -> Self {
        Self { r#type: String::from("update-arrow-type"), object_id, arrow_type }
    }
}

impl From<UpdateArrowTypeResponse> for Response {
    fn from(value: UpdateArrowTypeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
