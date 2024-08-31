use actix_web::web::{Data, Json, Path};
use actix_web::{HttpRequest, HttpResponse};
use serde::Deserialize;
use serde_json::json;

use crate::controller::auth::auth;
use crate::data::project::ProjectId;
use crate::db::store::user::{user_project_store, user_store};
use crate::db::Pool;
use crate::logger;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignUp {
    user_id: String,
}

pub async fn sign_up(pool: Data<Pool>, sign_up: Json<SignUp>) -> HttpResponse {
    match user_store::insert(&mut pool.get().unwrap(), &sign_up.user_id) {
        Ok(processed) => HttpResponse::Ok().json(json! {{"signUpNewUser": processed}}),
        Err(message) => {
            logger::http_error(&sign_up.user_id, "internal server error", &message);
            HttpResponse::InternalServerError().json(json! {{"message": &message}})
        }
    }
}

pub async fn joined(request: HttpRequest, pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    auth(
        request,
        format!("/user/joined/{project_id}"),
        |user_id| user_project_store::is_user_in_project(&mut pool.get().unwrap(), user_id, &project_id),
        |_| Ok(json! {{"joined": true}}),
    )
}

pub async fn get_pages(request: HttpRequest, pool: Data<Pool>) -> HttpResponse {
    auth(
        request,
        "/user/pages",
        |user_id| user_store::exists(&mut pool.get().unwrap(), user_id),
        |user_id| user_project_store::find_project_pages(&mut pool.get().unwrap(), user_id),
    )
}

pub async fn get_user_config(request: HttpRequest, pool: Data<Pool>) -> HttpResponse {
    auth(
        request,
        "/user/config",
        |user_id| user_store::exists(&mut pool.get().unwrap(), user_id),
        |user_id| user_store::find_one(&mut pool.get().unwrap(), user_id),
    )
}
