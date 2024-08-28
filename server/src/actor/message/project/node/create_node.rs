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

pub const TYPE: &str = "create-node";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct CreateNodeRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
    pub object_type: String,
    pub name: String,
    pub icon_id: String,
}

impl CreateNodeRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<CreateNodeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            object_type: parse_string(&json, "objectType")?,
            name: parse_string(&json, "name")?,
            icon_id: parse_string(&json, "iconId")?,
        })
    }
}

impl Handler<CreateNodeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: CreateNodeRequest, _: &mut Context<Self>) {
        logger::accept(&"john".to_string(), TYPE, &request);

        let accept = || -> Result<CreateNodeResponse, String> {
            project_node_store::insert(
                &mut self.get_conn()?,
                &request.object_id,
                &request.project_id,
                &request.object_type,
                &request.name,
                &request.icon_id,
            )?;

            Ok(CreateNodeResponse::new(request.object_id, request.object_type, request.name, request.icon_id))
        };

        match accept() {
            Ok(response) => self.send_to_project(&request.project_id, response, &request.session_id),
            Err(message) => self.send_to_self(ErrorInformationResponse::new(message), &request.session_id),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateNodeResponse {
    r#type: String,
    object_id: ObjectId,
    object_type: String,
    name: String,
    icon_id: String,
}

impl CreateNodeResponse {
    fn new(object_id: ObjectId, object_type: String, name: String, icon_id: String) -> Self {
        Self { r#type: TYPE.to_string(), object_id, object_type, name, icon_id }
    }
}

impl From<CreateNodeResponse> for Response {
    fn from(value: CreateNodeResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
