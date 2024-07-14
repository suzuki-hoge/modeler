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
pub struct UpdateConnectionRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
    pub source: ObjectId,
    pub target: ObjectId,
}

impl UpdateConnectionRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<UpdateConnectionRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            source: parse_string(&json, "source")?,
            target: parse_string(&json, "target")?,
        })
    }
}

impl Handler<UpdateConnectionRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdateConnectionRequest, _: &mut Context<Self>) {
        println!("accept update-connection request");

        let response = UpdateConnectionResponse::new(request.object_id, request.source, request.target);
        self.send_to_project(&request.project_id, response.into(), &request.session_id);
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateConnectionResponse {
    r#type: String,
    object_id: ObjectId,
    source: ObjectId,
    target: ObjectId,
}

impl UpdateConnectionResponse {
    fn new(object_id: ObjectId, source: ObjectId, target: ObjectId) -> Self {
        Self { r#type: String::from("update-connection"), object_id, source, target }
    }
}

impl From<UpdateConnectionResponse> for Response {
    fn from(value: UpdateConnectionResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
