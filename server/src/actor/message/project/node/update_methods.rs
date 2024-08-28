use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::information::error_information::ErrorInformationResponse;
use crate::actor::message::{parse_string, parse_strings, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::project::ProjectId;
use crate::data::ObjectId;
use crate::db::store::project::project_node_store;
use crate::logger;

pub const TYPE: &str = "update-methods";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct UpdateMethodsRequest {
    pub session_id: SessionId,
    pub project_id: ProjectId,
    pub object_id: ObjectId,
    pub methods: Vec<String>,
}

impl UpdateMethodsRequest {
    pub fn parse(session_id: &SessionId, project_id: &ProjectId, json: Json) -> Result<UpdateMethodsRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            project_id: project_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            methods: parse_strings(&json, "methods")?,
        })
    }
}

impl Handler<UpdateMethodsRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdateMethodsRequest, _: &mut Context<Self>) {
        logger::accept(&"john".to_string(), TYPE, &request);

        let accept = || -> Result<UpdateMethodsResponse, String> {
            project_node_store::update_methods(&mut self.get_conn()?, &request.object_id, &request.methods)
                .map_err(|e| e.show())?;

            Ok(UpdateMethodsResponse::new(request.object_id, request.methods))
        };

        match accept() {
            Ok(response) => self.send_to_project(&request.project_id, response, &request.session_id),
            Err(message) => self.send_to_self(ErrorInformationResponse::new(message), &request.session_id),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMethodsResponse {
    r#type: String,
    object_id: ObjectId,
    methods: Vec<String>,
}

impl UpdateMethodsResponse {
    fn new(object_id: ObjectId, methods: Vec<String>) -> Self {
        Self { r#type: TYPE.to_string(), object_id, methods }
    }
}

impl From<UpdateMethodsResponse> for Response {
    fn from(value: UpdateMethodsResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
