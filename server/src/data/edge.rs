use serde::Serialize;

use crate::data::ObjectId;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectEdge {
    pub id: ObjectId,
    pub r#type: String,
    pub source: String,
    pub target: String,
    pub marker_end: String,
    pub data: EdgeData,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PageEdge {
    pub id: ObjectId,
    pub r#type: String,
    pub source: String,
    pub target: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EdgeData {
    pub arrow_type: String,
    pub label: String,
}
