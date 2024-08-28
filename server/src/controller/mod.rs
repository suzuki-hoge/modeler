use actix_web::HttpResponse;
use serde::Serialize;

use crate::logger;

pub mod debug_controller;
pub mod page_controller;
pub mod project_controller;
pub mod user_controller;

pub fn respond<T: Serialize>(result: Result<T, String>) -> HttpResponse {
    match result {
        Ok(value) => HttpResponse::Ok().json(value),
        Err(message) => {
            logger::error(&"john".to_string(), "http", message);
            HttpResponse::InternalServerError().body(r#"{"message": "some error occurred"}"#)
        }
    }
}
