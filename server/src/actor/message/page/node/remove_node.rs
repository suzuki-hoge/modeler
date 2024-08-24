use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::information::error_information::ErrorInformationResponse;
use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::page::PageId;
use crate::data::ObjectId;
use crate::db::store::page::page_node_store;
use crate::logger;

pub const TYPE: &str = "remove-node";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct RemoveNodeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
}

impl RemoveNodeRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<RemoveNodeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
        })
    }
}

impl Handler<RemoveNodeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: RemoveNodeRequest, _: &mut Context<Self>) {
        logger::accept(&"john".to_string(), TYPE, &request);

        let accept = || -> Result<RemoveNodeResponse, String> {
            page_node_store::delete_page_node(&mut self.get_conn()?, &request.object_id, &request.page_id)
                .map_err(|e| e.show())?;

            Ok(RemoveNodeResponse::new(request.object_id))
        };

        match accept() {
            Ok(response) => self.send_to_page(&request.page_id, response, &request.session_id),
            Err(message) => self.send_to_self(ErrorInformationResponse::new(message), &request.session_id),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoveNodeResponse {
    r#type: String,
    object_id: ObjectId,
}

impl RemoveNodeResponse {
    fn new(object_id: ObjectId) -> Self {
        Self { r#type: TYPE.to_string(), object_id }
    }
}

impl From<RemoveNodeResponse> for Response {
    fn from(value: RemoveNodeResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
