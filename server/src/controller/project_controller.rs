use actix_web::web::{Data, Path};
use actix_web::{HttpRequest, HttpResponse};

use crate::controller::auth::auth;
use crate::data::project::ProjectId;
use crate::db::store::project::node_icon_store;
use crate::db::store::user::user_project_page_store;
use crate::db::Pool;

pub async fn get_icons(request: HttpRequest, pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    auth(
        request,
        format!("/project/{project_id}/icons"),
        |user_id| user_project_page_store::is_user_in_project(&mut pool.get().unwrap(), user_id, &project_id),
        |_| node_icon_store::find(&mut pool.get().unwrap(), &project_id),
    )
}
