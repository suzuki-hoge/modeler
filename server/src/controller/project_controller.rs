use actix_web::{HttpRequest, HttpResponse};
use actix_web::web::{Data, Json, Path};
use serde::Deserialize;
use uuid::Uuid;

use crate::controller::auth::auth;
use crate::data::project::ProjectId;
use crate::db::Pool;
use crate::db::store::page::page_store;
use crate::db::store::project::{node_icon_store, project_edge_store, project_node_store, project_store};
use crate::db::store::user::{user_project_store, user_store};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProject {
    project_name: String,
    page_name: String,
}

pub async fn create(request: HttpRequest, pool: Data<Pool>, create_project: Json<CreateProject>) -> HttpResponse {
    auth(
        request,
        "/project/create",
        |user_id| user_store::exists(&mut pool.get().unwrap(), user_id),
        |user_id| {
            let project_id = Uuid::new_v4().to_string();
            project_store::insert(&mut pool.get().unwrap(), &project_id, &create_project.project_name)?;
            user_project_store::insert(&mut pool.get().unwrap(), user_id, &project_id)?;

            let page_id = Uuid::new_v4().to_string();
            page_store::insert(&mut pool.get().unwrap(), &page_id, &project_id, &create_project.page_name)
        },
    )
}

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
