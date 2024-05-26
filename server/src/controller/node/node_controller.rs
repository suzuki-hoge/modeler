use actix_web::web::Path;
use actix_web::Responder;
use serde_json::to_string as to_json_string;
use std::thread;
use std::time::Duration;
use uuid::Uuid;

use crate::data::node::{NodeData, NodeHeader, ProjectNode};
use crate::data::{ObjectId, ProjectId};

pub async fn get_node_headers(path: Path<(ProjectId, u64)>) -> impl Responder {
    let path = path.into_inner();
    thread::sleep(Duration::from_secs(path.1));

    let nodes = vec![
        NodeHeader {
            id: String::from("60252373-87ed-474e-a99b-24ea3df91061"),
            icon: String::from("DC"),
            name: Uuid::new_v4().to_string(),
        },
        NodeHeader {
            id: String::from("fd76cca4-9f6d-4c2d-b1e7-8db4953cb0d8"),
            icon: String::from("DC"),
            name: String::from("User"),
        },
        NodeHeader {
            id: String::from("2f92651f-27a2-444d-b66d-6fd65188ab2d"),
            icon: String::from("S"),
            name: String::from("UserStore"),
        },
    ];

    to_json_string(&nodes).unwrap()
}

pub async fn get_node(path: Path<(ProjectId, ObjectId, u64)>) -> impl Responder {
    let path = path.into_inner();
    thread::sleep(Duration::from_secs(path.2));

    let nodes = vec![
        ProjectNode {
            object_id: String::from("fd76cca4-9f6d-4c2d-b1e7-8db4953cb0d8"),
            data: NodeData {
                icon: String::from("C"),
                name: String::from("User"),
                properties: vec![String::from("name: String")],
                methods: vec![],
            },
        },
        ProjectNode {
            object_id: String::from("2f92651f-27a2-444d-b66d-6fd65188ab2d"),
            data: NodeData {
                icon: String::from("S"),
                name: String::from("UserStore"),
                properties: vec![],
                methods: vec![String::from("findAll(): List<User>"), String::from("save(user: User)")],
            },
        },
    ];
    if let Some(node) = nodes.iter().find(|node| node.object_id == path.1) {
        to_json_string(&node).unwrap()
    } else {
        to_json_string("{}").unwrap()
    }
}
