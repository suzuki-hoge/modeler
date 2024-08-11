use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::project::ProjectId;
use crate::data::ObjectId;
use crate::db::store::project::project_node_store;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct UpdateNameRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
    pub name: String,
}

impl UpdateNameRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<UpdateNameRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            name: parse_string(&json, "name")?,
        })
    }
}

impl Handler<UpdateNameRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdateNameRequest, _: &mut Context<Self>) {
        println!("accept update-name request");

        project_node_store::update_project_node_name(&mut self.pool.get().unwrap(), &request.object_id, &request.name)
            .unwrap();

        let response = UpdateNameResponse::new(request.object_id, request.name);
        self.send_to_project(&request.project_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateNameResponse {
    r#type: String,
    object_id: ObjectId,
    name: String,
}

impl UpdateNameResponse {
    fn new(object_id: ObjectId, name: String) -> Self {
        Self { r#type: String::from("update-name"), object_id, name }
    }
}

impl From<UpdateNameResponse> for Response {
    fn from(value: UpdateNameResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
