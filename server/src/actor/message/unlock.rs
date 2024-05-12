use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::{PageId, SessionId};
use crate::data::ObjectId;
use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct UnlockRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
}

impl UnlockRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<UnlockRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "object_id")?,
        })
    }
}

impl Handler<UnlockRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UnlockRequest, _: &mut Context<Self>) {
        println!("accept unlock request");

        let response = UnlockResponse::new(request.object_id);
        self.respond_to_session(&request.page_id, response.into(), Some(&request.session_id));
    }
}

#[derive(Serialize)]
pub struct UnlockResponse {
    r#type: String,
    object_id: ObjectId,
}

impl UnlockResponse {
    fn new(object_id: ObjectId) -> Self {
        Self { r#type: String::from("unlock"), object_id }
    }
}

impl From<UnlockResponse> for Response {
    fn from(value: UnlockResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
