use actix_web::web::{Data, Path};
use actix_web::HttpResponse;

use crate::controller::respond;
use crate::data::project::ProjectId;
use crate::db::store::page::page_store;
use crate::db::store::project::{node_icon_store, project_edge_store, project_node_store, project_store};
use crate::db::Pool;

pub async fn get_projects(pool: Data<Pool>) -> HttpResponse {
    println!("/projects");

    respond(project_store::find_all(&mut pool.get().unwrap()))
}

pub async fn get_pages(pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    println!("/project/{project_id}/pages");

    respond(page_store::find_pages(&mut pool.get().unwrap(), &project_id))
}

pub async fn get_icons(pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    println!("/project/{project_id}/icons");

    respond(node_icon_store::find_node_icons(&mut pool.get().unwrap(), &project_id))
}

pub async fn get_nodes(pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    println!("/project/{project_id}/nodes");

    respond(project_node_store::find_project_nodes(&mut pool.get().unwrap(), &project_id))
}

pub async fn get_edges(pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    println!("/project/{project_id}/edges");

    respond(project_edge_store::find_project_edges(&mut pool.get().unwrap(), &project_id))
}
