use actix_web::web::{Data, Path};
use actix_web::{HttpRequest, HttpResponse};

use crate::controller::auth::auth;
use crate::data::user::UserId;
use crate::db::store::user::{user_project_store, user_store};
use crate::db::Pool;

pub async fn get_pages(request: HttpRequest, pool: Data<Pool>, path: Path<UserId>) -> HttpResponse {
    let path_user_id = path.into_inner();

    auth(
        request,
        format!("/user/{path_user_id}/pages"),
        |header_user_id| Ok(header_user_id == &path_user_id),
        || user_project_store::find_pages(&mut pool.get().unwrap(), &path_user_id),
    )
}

pub async fn get_user_config(request: HttpRequest, pool: Data<Pool>, path: Path<UserId>) -> HttpResponse {
    let path_user_id = path.into_inner();

    auth(
        request,
        format!("/user/{path_user_id}/config"),
        |header_user_id| Ok(header_user_id == &path_user_id),
        || user_store::find_one(&mut pool.get().unwrap(), &path_user_id),
    )
}
