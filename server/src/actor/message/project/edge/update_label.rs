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

        let accept = || -> Result<UpdateLabelResponse, String> {
            project_edge_store::update_project_edge_label(&mut self.get_conn()?, &request.object_id, &request.label)
                .map_err(|e| e.show())?;

            Ok(UpdateLabelResponse::new(request.object_id, request.label))
        };

        self.send_to_project(&request.project_id, accept(), &request.session_id);
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
