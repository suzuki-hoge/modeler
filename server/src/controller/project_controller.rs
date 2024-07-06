use actix_web::web::{Data, Path};
use actix_web::Responder;
use serde_json::to_string as to_json_string;

use crate::data::edge::{EdgeData, ProjectEdge};
use crate::data::node::NodeIcon;
use crate::data::project::ProjectId;
use crate::db::store::page::page_store;
use crate::db::store::project::{project_node_store, project_store};
use crate::db::Pool;

pub async fn get_projects(pool: Data<Pool>) -> impl Responder {
    println!("/projects");

    match project_store::find_all(pool.get().unwrap()) {
        Ok(rows) => to_json_string(&rows).unwrap(),
        Err(e) => e.to_string(),
    }
}

pub async fn get_pages(pool: Data<Pool>, path: Path<ProjectId>) -> impl Responder {
    println!("/pages");

    let project_id = path.into_inner();

    match page_store::find(pool.get().unwrap(), &project_id) {
        Ok(rows) => to_json_string(&rows).unwrap(),
        Err(e) => e.to_string(),
    }
}

pub async fn get_icons(path: Path<ProjectId>) -> impl Responder {
    println!("project/icons");
    let _project_id = path.into_inner();

    let icons = vec![
        NodeIcon {
            id: String::from("default"),
            preview: String::from("C"),
            desc: String::from("Class"),
            color: String::from("lightgray"),
        },
        NodeIcon {
            id: String::from("fb951145-bea1-4934-b44f-bdaa63c79763"),
            preview: String::from("C"),
            desc: String::from("Controller"),
            color: String::from("lightgray"),
        },
        NodeIcon {
            id: String::from("9a64593c-98d7-4420-b5ae-d2b022b345f9"),
            preview: String::from("UC"),
            desc: String::from("UseCase"),
            color: String::from("lightcyan"),
        },
        NodeIcon {
            id: String::from("50c9f120-6d07-4bb2-a935-bc674e18d137"),
            preview: String::from("S"),
            desc: String::from("Store"),
            color: String::from("lightgreen"),
        },
        NodeIcon {
            id: String::from("5cc0cdfc-fd4f-405c-b383-1d54f3f1c4b7"),
            preview: String::from("D"),
            desc: String::from("Data"),
            color: String::from("lightpink"),
        },
    ];

    to_json_string(&icons).unwrap()
}

pub async fn get_nodes(pool: Data<Pool>, path: Path<ProjectId>) -> impl Responder {
    println!("project/nodes");

    let project_id = path.into_inner();

    match project_node_store::find(pool.get().unwrap(), &project_id) {
        Ok(rows) => to_json_string(&rows).unwrap(),
        Err(e) => e.to_string(),
    }
}

pub async fn get_edges(path: Path<ProjectId>) -> impl Responder {
    println!("project/edges");
    let _project_id = path.into_inner();

    let edges = vec![
        ProjectEdge {
            id: String::from("1b9db214-d3b7-4433-8f2d-266d1dd50504"),
            r#type: String::from("class"),
            source: String::from("fd76cca4-9f6d-4c2d-b1e7-8db4953cb0d8"),
            target: String::from("2f92651f-27a2-444d-b66d-6fd65188ab2d"),
            marker_end: String::from("simple"),
            data: EdgeData { arrow_type: String::from("simple"), label: String::from("1") },
        },
        ProjectEdge {
            id: String::from("f0d57124-7843-452e-9782-ae81ba4c3ea7"),
            r#type: String::from("class"),
            source: String::from("2f92651f-27a2-444d-b66d-6fd65188ab2d"),
            target: String::from("3fe61ea6-7d1b-45ea-a421-96c5659cd797"),
            marker_end: String::from("simple"),
            data: EdgeData { arrow_type: String::from("simple"), label: String::from("0..1") },
        },
    ];

    to_json_string(&edges).unwrap()
}
