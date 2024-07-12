use serde::Serialize;

use crate::data::project::ProjectId;

pub type PageId = String;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    pub page_id: PageId,
    pub project_id: ProjectId,
    pub name: String,
}
