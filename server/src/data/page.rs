use crate::data::project::ProjectId;
use serde::Serialize;

pub type PageId = String;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    pub page_id: PageId,
    pub project_id: ProjectId,
    pub name: String,
}
