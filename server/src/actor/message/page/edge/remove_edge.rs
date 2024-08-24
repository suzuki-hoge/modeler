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

pub const TYPE: &str = "remove-edge";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct RemoveEdgeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
}

impl RemoveEdgeRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<RemoveEdgeRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
        })
    }
}

impl Handler<RemoveEdgeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: RemoveEdgeRequest, _: &mut Context<Self>) {
        logger::accept(&"john".to_string(), TYPE, &request);

        let accept = || -> Result<RemoveEdgeResponse, String> {
            page_edge_store::delete_page_edge(&mut self.get_conn()?, &request.object_id, &request.page_id)
                .map_err(|e| e.show())?;

            Ok(RemoveEdgeResponse::new(request.object_id))
        };

        match accept() {
            Ok(response) => self.send_to_page(&request.page_id, response, &request.session_id),
            Err(message) => self.send_to_self(ErrorInformationResponse::new(message), &request.session_id),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoveEdgeResponse {
    r#type: String,
    object_id: ObjectId,
}

impl RemoveEdgeResponse {
    fn new(object_id: ObjectId) -> Self {
        Self { r#type: TYPE.to_string(), object_id }
    }
}

impl From<RemoveEdgeResponse> for Response {
    fn from(value: RemoveEdgeResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
