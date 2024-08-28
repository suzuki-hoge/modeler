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
use crate::db::store::page::page_edge_store;
use crate::logger;

pub const TYPE: &str = "add-edge";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct AddEdgeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub object_type: String,
    pub source: ObjectId,
    pub target: ObjectId,
    pub source_handle: String,
    pub target_handle: String,
}

impl AddEdgeRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<AddEdgeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            object_type: parse_string(&json, "objectType")?,
            source: parse_string(&json, "source")?,
            target: parse_string(&json, "target")?,
            source_handle: parse_string(&json, "sourceHandle")?,
            target_handle: parse_string(&json, "targetHandle")?,
        })
    }
}

impl Handler<AddEdgeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: AddEdgeRequest, _: &mut Context<Self>) {
        logger::accept(&"john".to_string(), TYPE, &request);

        let accept = || -> Result<AddEdgeResponse, String> {
            page_edge_store::create(
                &mut self.get_conn()?,
                &request.object_id,
                &request.page_id,
                &request.object_type,
                &request.source,
                &request.target,
                &request.source_handle,
                &request.target_handle,
            )
            .map_err(|e| e.show())?;

            Ok(AddEdgeResponse::new(
                request.object_id,
                request.object_type,
                request.source,
                request.target,
                request.source_handle,
                request.target_handle,
            ))
        };

        match accept() {
            Ok(response) => self.send_to_page(&request.page_id, response, &request.session_id),
            Err(message) => self.send_to_self(ErrorInformationResponse::new(message), &request.session_id),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddEdgeResponse {
    r#type: String,
    object_id: ObjectId,
    object_type: String,
    source: ObjectId,
    target: ObjectId,
    source_handle: String,
    target_handle: String,
}

impl AddEdgeResponse {
    fn new(
        object_id: ObjectId,
        object_type: String,
        source: ObjectId,
        target: ObjectId,
        source_handle: String,
        target_handle: String,
    ) -> Self {
        Self { r#type: TYPE.to_string(), object_id, object_type, source, target, source_handle, target_handle }
    }
}

impl From<AddEdgeResponse> for Response {
    fn from(value: AddEdgeResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
