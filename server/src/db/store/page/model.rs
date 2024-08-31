use diesel::{Insertable, Queryable, Selectable};

use crate::data::edge::PageEdge;
use crate::data::node::PageNode;
use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::data::{ObjectId, Position};
use crate::db::schema::page;
use crate::db::schema::page_edge;
use crate::db::schema::page_node;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = page)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct PageRow {
    pub page_id: PageId,
    pub project_id: ProjectId,
    pub name: String,
}

impl PageRow {
    pub fn new(page_id: &PageId, project_id: &ProjectId, name: &str) -> Self {
        Self { page_id: page_id.clone(), project_id: project_id.clone(), name: name.to_string() }
    }
}

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = page_node)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct PageNodeRow {
    object_id: String,
    page_id: String,
    object_type: String,
    x: String,
    y: String,
}

impl PageNodeRow {
    pub fn new(object_id: &ObjectId, page_id: &PageId, object_type: &str, x: f64, y: f64) -> Self {
        Self {
            object_id: object_id.clone(),
            page_id: page_id.clone(),
            object_type: object_type.to_string(),
            x: x.to_string(),
            y: y.to_string(),
        }
    }
}

impl From<PageNodeRow> for PageNode {
    fn from(row: PageNodeRow) -> Self {
        Self {
            id: row.object_id,
            r#type: row.object_type,
            position: Position { x: row.x.parse().unwrap(), y: row.y.parse().unwrap() },
        }
    }
}

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = page_edge)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct PageEdgeRow {
    object_id: ObjectId,
    page_id: PageId,
    object_type: String,
    source: ObjectId,
    target: ObjectId,
    source_handle: String,
    target_handle: String,
}

impl PageEdgeRow {
    pub fn new(
        object_id: &ObjectId,
        page_id: &PageId,
        object_type: &str,
        source: &ObjectId,
        target: &ObjectId,
        source_handle: &str,
        target_handle: &str,
    ) -> Self {
        Self {
            object_id: object_id.clone(),
            page_id: page_id.clone(),
            object_type: object_type.to_string(),
            source: source.clone(),
            target: target.clone(),
            source_handle: source_handle.to_string(),
            target_handle: target_handle.to_string(),
        }
    }
}

impl From<PageEdgeRow> for PageEdge {
    fn from(row: PageEdgeRow) -> Self {
        Self {
            id: row.object_id,
            r#type: row.object_type,
            source: row.source,
            target: row.target,
            source_handle: row.source_handle,
            target_handle: row.target_handle,
        }
    }
}
