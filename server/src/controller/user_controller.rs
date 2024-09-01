use actix_web::web::Data;
use actix_web::{HttpRequest, HttpResponse};

use crate::controller::auth::auth;
use crate::db::store::user::user_store;
use crate::db::Pool;

pub async fn sign_up(request: HttpRequest, pool: Data<Pool>) -> HttpResponse {
    auth(request, |_| Ok(true), |user_id| user_store::sign_up(&mut pool.get().unwrap(), user_id))
}

pub async fn get_user_config(request: HttpRequest, pool: Data<Pool>) -> HttpResponse {
    auth(
        request,
        |user_id| user_store::exists(&mut pool.get().unwrap(), user_id),
        |user_id| user_store::find_user_config(&mut pool.get().unwrap(), user_id),
    )
}
