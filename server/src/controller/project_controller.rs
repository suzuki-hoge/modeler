use actix_web::web::{Data, Path};
use actix_web::{HttpRequest, HttpResponse};

use crate::controller::auth::auth;
use crate::data::project::ProjectId;
use crate::db::store::page::page_store;
use crate::db::store::project::{node_icon_store, project_edge_store, project_node_store};
use crate::db::store::user::user_project_store;
use crate::db::Pool;

pub async fn get_pages(request: HttpRequest, pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    auth(
        request,
        format!("/project/{project_id}/pages"),
        |user_id| user_project_store::is_user_in_project(&mut pool.get().unwrap(), user_id, &project_id),
        |_| page_store::find(&mut pool.get().unwrap(), &project_id),
    )
}

pub async fn get_icons(request: HttpRequest, pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    auth(
        request,
        format!("/project/{project_id}/icons"),
        |user_id| user_project_store::is_user_in_project(&mut pool.get().unwrap(), user_id, &project_id),
        |_| node_icon_store::find(&mut pool.get().unwrap(), &project_id),
    )
}

pub async fn get_nodes(request: HttpRequest, pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    auth(
        request,
        format!("/project/{project_id}/nodes"),
        |user_id| user_project_store::is_user_in_project(&mut pool.get().unwrap(), user_id, &project_id),
        |_| project_node_store::find(&mut pool.get().unwrap(), &project_id),
    )
}

pub async fn get_edges(request: HttpRequest, pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    auth(
        request,
        format!("/project/{project_id}/edges"),
        |user_id| user_project_store::is_user_in_project(&mut pool.get().unwrap(), user_id, &project_id),
        |_| project_edge_store::find(&mut pool.get().unwrap(), &project_id),
    )
}
