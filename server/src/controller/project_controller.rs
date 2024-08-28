use actix_web::web::{Data, Path};
use actix_web::HttpResponse;

use crate::controller::respond;
use crate::data::project::ProjectId;
use crate::db::store::page::page_store;
use crate::db::store::project::{node_icon_store, project_edge_store, project_node_store, project_store};
use crate::db::Pool;
use crate::logger;

pub async fn get_projects(pool: Data<Pool>) -> HttpResponse {
    logger::get(&"john".to_string(), "/projects");

    respond(project_store::find(&mut pool.get().unwrap()))
}

pub async fn get_pages(pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    logger::get(&"john".to_string(), format!("/project/{project_id}/pages"));

    respond(page_store::find(&mut pool.get().unwrap(), &project_id))
}

pub async fn get_icons(pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    logger::get(&"john".to_string(), format!("/project/{project_id}/icons"));

    respond(node_icon_store::find(&mut pool.get().unwrap(), &project_id))
}

pub async fn get_nodes(pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    logger::get(&"john".to_string(), format!("/project/{project_id}/nodes"));

    respond(project_node_store::find(&mut pool.get().unwrap(), &project_id))
}

pub async fn get_edges(pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    logger::get(&"john".to_string(), format!("/project/{project_id}/edges"));

    respond(project_edge_store::find(&mut pool.get().unwrap(), &project_id))
}
