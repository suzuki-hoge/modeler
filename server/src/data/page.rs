use serde::Serialize;

pub type PageId = String;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    pub page_id: PageId,
    pub name: String,
}
