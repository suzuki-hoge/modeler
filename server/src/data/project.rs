use serde::Serialize;

pub type ProjectId = String;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub project_id: ProjectId,
    pub name: String,
}
