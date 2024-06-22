use serde::Serialize;

use crate::data::ObjectId;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectEdge {
    pub object_id: ObjectId,
    pub r#type: String,
    pub source: String,
    pub source_handle: String,
    pub target: String,
    pub target_handle: String,
    pub marker_end: String,
    pub data: EdgeData,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PageEdge {
    pub object_id: ObjectId,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EdgeData {
    pub arrow_type: String,
    pub label: String,
}
