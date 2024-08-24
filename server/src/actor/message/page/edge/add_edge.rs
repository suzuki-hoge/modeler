use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::SessionId;
use crate::data::page::PageId;
use crate::data::ObjectId;
use crate::db::store::page::page_edge_store;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct AddEdgeRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub object_type: String,
    pub source: ObjectId,
    pub target: ObjectId,
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
        })
    }
}

impl Handler<AddEdgeRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: AddEdgeRequest, _: &mut Context<Self>) {
        println!("accept add-edge request");

        let accept = || -> Result<AddEdgeResponse, String> {
            page_edge_store::create_page_edge(
                &mut self.get_conn()?,
                &request.object_id,
                &request.page_id,
                &request.object_type,
                &request.source,
                &request.target,
            )
            .map_err(|e| e.show())?;

            Ok(AddEdgeResponse::new(request.object_id, request.object_type, request.source, request.target))
        };

        self.send_to_page(&request.page_id, accept(), &request.session_id)
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
}

impl AddEdgeResponse {
    fn new(object_id: ObjectId, object_type: String, source: ObjectId, target: ObjectId) -> Self {
        Self { r#type: String::from("add-edge"), object_id, object_type, source, target }
    }
}

impl From<AddEdgeResponse> for Response {
    fn from(value: AddEdgeResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
