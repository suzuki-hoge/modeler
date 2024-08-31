use crate::actor::message::{parse_bool, parse_string, Json};
use crate::actor::server::Server;
use crate::actor::SessionId;
use crate::data::user::UserId;
use crate::db::store::user::user_store;
use crate::logger;
use actix::{Context, Handler, Message as ActixMessage};
use serde::Serialize;

pub const TYPE: &str = "update-user-config";

#[derive(ActixMessage, Serialize)]
#[rtype(result = "()")]
pub struct UpdateUserConfigRequest {
    pub user_id: UserId,
    pub session_id: SessionId,
    pub reflect_page_object_on_text_input: bool,
    pub show_base_type_attributes: bool,
    pub show_in_second_language: bool,
}

impl UpdateUserConfigRequest {
    pub fn parse(session_id: &SessionId, json: Json) -> Result<UpdateUserConfigRequest, String> {
        Ok(Self {
            user_id: parse_string(&json, "userId")?,
            session_id: session_id.clone(),
            reflect_page_object_on_text_input: parse_bool(&json, "reflectPageObjectOnTextInput")?,
            show_base_type_attributes: parse_bool(&json, "showBaseTypeAttributes")?,
            show_in_second_language: parse_bool(&json, "showInSecondLanguage")?,
        })
    }
}

impl Handler<UpdateUserConfigRequest> for Server {
    type Result = ();

    fn handle(&mut self, request: UpdateUserConfigRequest, _: &mut Context<Self>) {
        logger::accept(&request.session_id, TYPE, &request);

        let accept = || -> Result<(), String> {
            user_store::update_user_config(
                &mut self.get_conn()?,
                &request.user_id,
                request.reflect_page_object_on_text_input,
                request.show_base_type_attributes,
                request.show_in_second_language,
            )?;

            Ok(())
        };

        match accept() {
            Ok(_) => println!("ok"),
            Err(e) => println!("error: {e}"),
        }
        // fixme: notice error for me
    }
}
