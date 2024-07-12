use actix_web::HttpResponse;
use serde::Serialize;

pub mod page_controller;
pub mod project_controller;

pub fn respond<T: Serialize>(result: Result<T, String>) -> HttpResponse {
    match result {
        Ok(value) => HttpResponse::Ok().json(value),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}
