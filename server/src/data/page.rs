use serde::Serialize;

use crate::data::project::ProjectId;

pub type PageId = String;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    pub page_id: PageId,
    pub name: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectPage {
    pub project_id: ProjectId,
    pub project_name: String,
    pub page_id: PageId,
    pub page_name: String,
}
