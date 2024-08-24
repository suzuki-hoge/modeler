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
use crate::logger;

pub const TYPE: &str = "update-icon-id";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct UpdateIconIdRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
    pub icon_id: String,
}

impl UpdateIconIdRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<UpdateIconIdRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            icon_id: parse_string(&json, "iconId")?,
        })
    }
}

impl Handler<UpdateIconIdRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdateIconIdRequest, _: &mut Context<Self>) {
        logger::accept(&"john".to_string(), TYPE, &request);

        let accept = || -> Result<UpdateIconIdResponse, String> {
            project_node_store::update_project_node_icon_id(
                &mut self.get_conn()?,
                &request.object_id,
                &request.icon_id,
            )
            .map_err(|e| e.show())?;

            Ok(UpdateIconIdResponse::new(request.object_id, request.icon_id))
        };

        match accept() {
            Ok(response) => self.send_to_project(&request.project_id, response, &request.session_id),
            Err(message) => self.send_to_self(message, &request.session_id),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateIconIdResponse {
    r#type: String,
    object_id: ObjectId,
    icon_id: String,
}

impl UpdateIconIdResponse {
    fn new(object_id: ObjectId, icon_id: String) -> Self {
        Self { r#type: TYPE.to_string(), object_id, icon_id }
    }
}

impl From<UpdateIconIdResponse> for Response {
    fn from(value: UpdateIconIdResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
