use actix_web::Responder;
use actix_web::web::Path;
use serde_json::to_string as to_json_string;

use crate::data::Position;
use crate::data::edge::PageEdge;
use crate::data::node::PageNode;
use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::db::store::page;

pub async fn get_pages(path: Path<ProjectId>) -> impl Responder {
    println!("/pages");

    let project_id = path.into_inner();

    match page::find(&project_id) {
        Ok(rows) => to_json_string(&rows).unwrap(),
        Err(e) => e.to_string(),
    }
}

pub async fn get_nodes(path: Path<(ProjectId, PageId)>) -> impl Responder {
    println!("page/nodes");
    let (_project_id, _page_id) = path.into_inner();

    if &_page_id == "1" {
        let nodes = vec![
            PageNode {
                id: String::from("fd76cca4-9f6d-4c2d-b1e7-8db4953cb0d8"),
                r#type: String::from("class"),
                position: Position { x: 0.0, y: 0.0 },
            },
            PageNode {
                id: String::from("2f92651f-27a2-444d-b66d-6fd65188ab2d"),
                r#type: String::from("class"),
                position: Position { x: 250.0, y: 300.0 },
            },
        ];

        to_json_string(&nodes).unwrap()
    } else {
        let nodes = vec![
            PageNode {
                id: String::from("2f92651f-27a2-444d-b66d-6fd65188ab2d"),
                r#type: String::from("class"),
                position: Position { x: 0.0, y: 0.0 },
            },
            PageNode {
                id: String::from("3fe61ea6-7d1b-45ea-a421-96c5659cd797"),
                r#type: String::from("class"),
                position: Position { x: 50.0, y: 80.0 },
            },
        ];

        to_json_string(&nodes).unwrap()
    }
}

pub async fn get_edges(path: Path<(ProjectId, PageId)>) -> impl Responder {
    println!("page/edges");
    let (_project_id, _page_id) = path.into_inner();

    if &_page_id == "1" {
        let edges = vec![PageEdge {
            id: String::from("1b9db214-d3b7-4433-8f2d-266d1dd50504"),
            r#type: String::from("class"),
            source: String::from("fd76cca4-9f6d-4c2d-b1e7-8db4953cb0d8"),
            target: String::from("2f92651f-27a2-444d-b66d-6fd65188ab2d"),
        }];

        to_json_string(&edges).unwrap()
    } else {
        let edges: Vec<PageEdge> = vec![];

        to_json_string(&edges).unwrap()
    }
}