use actix_web::web::Path;
use actix_web::Responder;
use serde_json::to_string as to_json_string;

use crate::data::edge::{EdgeData, ProjectEdge};
use crate::data::node::{NodeData, NodeIcon, ProjectNode};
use crate::data::page::Page;
use crate::data::ProjectId;

pub async fn get_pages(path: Path<ProjectId>) -> impl Responder {
    let _project_id = path.into_inner();

    let pages = vec![
        Page { page_id: String::from("34955f5f-87fe-4b9b-96d6-a4f17821c0f8"), name: String::from("クラス図１") },
        Page { page_id: String::from("35cefa97-eb4c-4fbb-baa1-80cd39d655ee"), name: String::from("クラス図２") },
    ];

    to_json_string(&pages).unwrap()
}

pub async fn get_icons(path: Path<ProjectId>) -> impl Responder {
    let _project_id = path.into_inner();

    let icons = vec![
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

pub async fn get_nodes(path: Path<ProjectId>) -> impl Responder {
    let _project_id = path.into_inner();

    let nodes = vec![
        ProjectNode {
            object_id: String::from("fd76cca4-9f6d-4c2d-b1e7-8db4953cb0d8"),
            r#type: String::from("class"),
            data: NodeData {
                icon_id: String::from("fb951145-bea1-4934-b44f-bdaa63c79763"),
                name: String::from("ItemController"),
                properties: vec![],
                methods: vec![String::from("apply()")],
            },
        },
        ProjectNode {
            object_id: String::from("2f92651f-27a2-444d-b66d-6fd65188ab2d"),
            r#type: String::from("class"),
            data: NodeData {
                icon_id: String::from("50c9f120-6d07-4bb2-a935-bc674e18d137"),
                name: String::from("ItemStore"),
                properties: vec![],
                methods: vec![String::from("findAll(): List<ref#item#>"), String::from("save(item: ref#item#)")],
            },
        },
        ProjectNode {
            object_id: String::from("3fe61ea6-7d1b-45ea-a421-96c5659cd797"),
            r#type: String::from("class"),
            data: NodeData {
                icon_id: String::from("5cc0cdfc-fd4f-405c-b383-1d54f3f1c4b7"),
                name: String::from("Item"),
                properties: vec![String::from("value: Int")],
                methods: vec![String::from("get(): Int"), String::from("set(value: Int)")],
            },
        },
    ];

    to_json_string(&nodes).unwrap()
}

pub async fn get_edges(path: Path<ProjectId>) -> impl Responder {
    let _project_id = path.into_inner();

    let edges = vec![
        ProjectEdge {
            object_id: String::from("1b9db214-d3b7-4433-8f2d-266d1dd50504"),
            r#type: String::from("class"),
            source: String::from("fd76cca4-9f6d-4c2d-b1e7-8db4953cb0d8"),
            source_handle: String::from("center"),
            target: String::from("2f92651f-27a2-444d-b66d-6fd65188ab2d"),
            target_handle: String::from("center"),
            marker_end: String::from("simple"),
            data: EdgeData { arrow_type: String::from("simple"), label: String::from("1") },
        },
        ProjectEdge {
            object_id: String::from("f0d57124-7843-452e-9782-ae81ba4c3ea7"),
            r#type: String::from("class"),
            source: String::from("2f92651f-27a2-444d-b66d-6fd65188ab2d"),
            source_handle: String::from("center"),
            target: String::from("3fe61ea6-7d1b-45ea-a421-96c5659cd797"),
            target_handle: String::from("center"),
            marker_end: String::from("simple"),
            data: EdgeData { arrow_type: String::from("simple"), label: String::from("0..1") },
        },
    ];

    to_json_string(&edges).unwrap()
}
