use actix_web::web::{Data, Path};
use actix_web::{HttpRequest, HttpResponse};

use crate::controller::auth::auth;
use crate::data::project::ProjectId;
use crate::db::store::user::{user_project_store, user_store};
use crate::db::Pool;

pub async fn join(request: HttpRequest, pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    auth(
        request,
        |user_id| user_store::exists(&mut pool.get().unwrap(), user_id),
        |user_id| user_project_store::create(&mut pool.get().unwrap(), user_id, &project_id),
    )
}
