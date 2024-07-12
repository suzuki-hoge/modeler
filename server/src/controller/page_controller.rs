use actix_web::web::{Data, Path};
use actix_web::Responder;
use serde_json::to_string as to_json_string;

use crate::data::edge::PageEdge;
use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::db::store::page::page_node_store;
use crate::db::Pool;

pub async fn get_nodes(pool: Data<Pool>, path: Path<(ProjectId, PageId)>) -> impl Responder {
    println!("page/nodes");

    let (_project_id, page_id) = path.into_inner();

    match page_node_store::find_page_nodes(pool.get().unwrap(), &page_id) {
        Ok(rows) => to_json_string(&rows).unwrap(),
        Err(e) => e.to_string(),
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
