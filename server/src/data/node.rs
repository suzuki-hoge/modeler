use crate::data::{ObjectId, Position};
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectNode {
    pub object_id: ObjectId,
    pub r#type: String,
    pub data: NodeData,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PageNode {
    pub object_id: ObjectId,
    pub position: Position,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeData {
    pub icon_id: String,
    pub name: String,
    pub properties: Vec<String>,
    pub methods: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeIcon {
    pub id: String,
    pub preview: String,
    pub desc: String,
    pub color: String,
}
