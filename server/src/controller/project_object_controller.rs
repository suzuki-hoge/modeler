use actix_web::web::{Data, Path};
use actix_web::{HttpRequest, HttpResponse};

use crate::controller::auth::auth;
use crate::data::project::ProjectId;
use crate::db::store::project::{project_edge_store, project_node_store};
use crate::db::store::user::user_project_page_store;
use crate::db::Pool;

pub async fn get_nodes(request: HttpRequest, pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    auth(
        request,
        |user_id| user_project_page_store::is_user_in_project(&mut pool.get().unwrap(), user_id, &project_id),
        |_| project_node_store::find(&mut pool.get().unwrap(), &project_id),
    )
}

pub async fn get_edges(request: HttpRequest, pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    auth(
        request,
        |user_id| user_project_page_store::is_user_in_project(&mut pool.get().unwrap(), user_id, &project_id),
        |_| project_edge_store::find(&mut pool.get().unwrap(), &project_id),
    )
}
