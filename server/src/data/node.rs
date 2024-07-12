use serde::{Deserialize, Serialize};

use crate::data::{ObjectId, Position};

#[derive(Serialize, Eq, PartialEq, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProjectNode {
    pub id: ObjectId,
    pub r#type: String,
    pub data: NodeData,
}

#[derive(Serialize, PartialEq, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PageNode {
    pub id: ObjectId,
    pub r#type: String,
    pub position: Position,
}

#[derive(Serialize, Deserialize, Eq, PartialEq, Clone, Debug)]
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
