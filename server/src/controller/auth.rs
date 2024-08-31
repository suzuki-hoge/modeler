use actix_web::{HttpRequest, HttpResponse};
use serde::Serialize;
use serde_json::json;

use crate::controller::auth::Error::{InvalidToken, NoToken, Some, Unauthorized};
use crate::data::user::UserId;
use crate::logger;

#[allow(dead_code)]
pub fn no_auth<T, S, F>(route: S, processor: F) -> HttpResponse
where
    T: Serialize,
    S: Into<String>,
    F: FnOnce() -> actix_web::Result<T, String>,
{
    let user_id = String::from("no-auth");
    logger::get(&user_id, route);

    match processor() {
        Ok(value) => HttpResponse::Ok().json(value),
        Err(message) => {
            logger::http_error(&user_id, "internal server error", &message);
            HttpResponse::InternalServerError().json(json! {{"message": &message}})
        }
    }
}

pub fn auth<T, S, F1, F2>(request: HttpRequest, route: S, authenticator: F1, processor: F2) -> HttpResponse
where
    T: Serialize,
    S: Into<String>,
    F1: FnOnce(&UserId) -> actix_web::Result<bool, String>,
    F2: FnOnce(&UserId) -> actix_web::Result<T, String>,
{
    match auth_inner(request, route, authenticator, processor) {
        Ok(value) => HttpResponse::Ok().json(value),
        Err(NoToken) => HttpResponse::Unauthorized().json(json! {{"message": "no token"}}),
        Err(InvalidToken) => HttpResponse::InternalServerError().json(json! {{"message": "invalid token"}}),
        Err(Unauthorized) => HttpResponse::NotFound().json(json! {{"message": "not found"}}),
        Err(Some { user_id, message }) => {
            logger::http_error(&user_id, "internal server error", &message);
            HttpResponse::InternalServerError().json(json! {{"message": &message}})
        }
    }
}

fn auth_inner<T, S, F1, F2>(
    request: HttpRequest,
    route: S,
    authenticator: F1,
    processor: F2,
) -> actix_web::Result<T, Error>
where
    T: Serialize,
    S: Into<String>,
    F1: FnOnce(&UserId) -> actix_web::Result<bool, String>,
    F2: FnOnce(&UserId) -> actix_web::Result<T, String>,
{
    let user_id = request
        .headers()
        .get("Modeler-User-Id")
        .ok_or(NoToken)
        .and_then(|header| header.to_str().map_err(|_| InvalidToken))
        .map(|s| s.to_string())?;

    let is_authenticated = authenticator(&user_id).map_err(|message| Some { user_id: user_id.clone(), message })?;

    if is_authenticated {
        logger::get(&user_id, route);
        processor(&user_id).map_err(|message| Some { user_id: user_id.clone(), message })
    } else {
        Err(Unauthorized)
    }
}

pub enum Error {
    NoToken,
    InvalidToken,
    Unauthorized,
    Some { user_id: UserId, message: String },
}
