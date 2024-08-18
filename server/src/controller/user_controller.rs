use actix_web::web::{Data, Path};
use actix_web::HttpResponse;

use crate::controller::respond;
use crate::data::user::UserId;
use crate::db::store::user::user_config_store;
use crate::db::Pool;

pub async fn get_user_config(pool: Data<Pool>, path: Path<UserId>) -> HttpResponse {
    let user_id = path.into_inner();

    println!("/user/{user_id}/config");

    respond(user_config_store::find(&mut pool.get().unwrap(), &user_id))
}
