use crate::data::ObjectId;
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectNode {
    pub object_id: ObjectId,
    pub data: NodeData,
}

#[derive(Serialize)]
pub struct NodeData {
    pub icon: String,
    pub name: String,
    pub properties: Vec<String>,
    pub methods: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NodeHeader {
    pub id: ObjectId,
    pub icon: String,
    pub name: String,
}
