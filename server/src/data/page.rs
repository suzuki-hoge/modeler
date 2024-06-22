use serde::Serialize;

use crate::data::PageId;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    pub page_id: PageId,
    pub name: String,
}
