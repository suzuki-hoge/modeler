use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::message::{parse_string, Json};
use crate::actor::server::Server;
use crate::actor::session::Response;
use crate::actor::{PageId, SessionId};
use crate::data::ObjectId;

#[derive(ActixMessage)]
#[rtype(result = "()")]
pub struct UpdateIconIdRequest {
    pub session_id: SessionId,
    pub page_id: PageId,
    pub object_id: ObjectId,
    pub icon_id: String,
}

impl UpdateIconIdRequest {
    pub fn parse(session_id: &SessionId, page_id: &PageId, json: Json) -> Result<UpdateIconIdRequest, String> {
        Ok(Self {
            session_id: session_id.clone(),
            page_id: page_id.clone(),
            object_id: parse_string(&json, "objectId")?,
            icon_id: parse_string(&json, "iconId")?,
        })
    }
}

impl Handler<UpdateIconIdRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdateIconIdRequest, _: &mut Context<Self>) {
        println!("accept update-icon-id request");

        let response = UpdateIconIdResponse::new(request.object_id, request.icon_id);
        self.send_to_page(&request.page_id, response.into(), &request.session_id);
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
        Self { r#type: String::from("update-icon-id"), object_id, icon_id }
    }
}

impl From<UpdateIconIdResponse> for Response {
    fn from(value: UpdateIconIdResponse) -> Self {
        Self { json: to_json_string(&value).unwrap() }
    }
}
