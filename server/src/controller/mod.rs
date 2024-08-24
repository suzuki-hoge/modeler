use actix_web::HttpResponse;
use serde::Serialize;

use crate::db::store::DatabaseError;
use crate::logger;

pub mod debug_controller;
pub mod page_controller;
pub mod project_controller;
pub mod user_controller;

pub fn respond<T: Serialize>(result: Result<T, DatabaseError>) -> HttpResponse {
    match result {
        Ok(value) => HttpResponse::Ok().json(value),
        Err(DatabaseError::InvalidKey) => {
            logger::error(&"john".to_string(), "404", "");
            HttpResponse::NotFound().finish()
        }
        Err(DatabaseError::UnexpectedRowMatched { count }) => {
            logger::error(&"john".to_string(), "500", format!("unexpected row matched: [ count = {}]", count));
            HttpResponse::InternalServerError().body(r#"{"message": "some error occurred"}"#)
        }
        Err(DatabaseError::Other { origin }) => {
            logger::error(&"john".to_string(), "500", format!("some error occurred: [ origin = {}]", origin));
            HttpResponse::InternalServerError().body(r#"{"message": "some error occurred"}"#)
        }
    }
}
