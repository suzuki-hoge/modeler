use crate::data::page::PageId;
use crate::data::project::ProjectId;
use serde::Serialize;

pub type UserId = String;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: UserId,
    pub name: String,
    pub icon: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserConfig {
    pub id: UserId,
    pub reflect_page_object_on_text_input: bool,
    pub show_base_type_attributes: bool,
    pub show_in_second_language: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserProjectPage {
    pub project_id: ProjectId,
    pub project_name: String,
    pub page_id: PageId,
    pub page_name: String,
}
