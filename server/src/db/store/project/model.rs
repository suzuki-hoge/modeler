use diesel::{Insertable, Queryable, Selectable};
use serde_json::from_str as from_json_str;
use serde_json::to_string as to_json_string;

use crate::data::edge::{EdgeData, ProjectEdge};
use crate::data::node::{NodeData, NodeIcon, ProjectNode};
use crate::data::project::{Project, ProjectId};
use crate::data::ObjectId;
use crate::db::schema::node_icon;
use crate::db::schema::project;
use crate::db::schema::project_edge;
use crate::db::schema::project_node;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = project)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct ProjectRow {
    pub project_id: ProjectId,
    pub name: String,
}

impl ProjectRow {
    pub fn new(project_id: &ProjectId, name: &str) -> Self {
        Self { project_id: project_id.clone(), name: name.to_string() }
    }
}

impl From<ProjectRow> for Project {
    fn from(row: ProjectRow) -> Self {
        Self { project_id: row.project_id, name: row.name }
    }
}

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = project_node)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct ProjectNodeRow {
    object_id: ObjectId,
    project_id: ProjectId,
    object_type: String,
    name: String,
    icon_id: String,
    properties: String,
    methods: String,
}

impl ProjectNodeRow {
    pub fn new(object_id: &ObjectId, project_id: &ProjectId, object_type: &str, name: &str, icon_id: &str) -> Self {
        let empty: Vec<String> = vec![];
        Self {
            object_id: object_id.clone(),
            project_id: project_id.clone(),
            object_type: object_type.to_string(),
            name: name.to_string(),
            icon_id: icon_id.to_string(),
            properties: to_json_string(&empty).unwrap(),
            methods: to_json_string(&empty).unwrap(),
        }
    }
}

impl From<ProjectNodeRow> for ProjectNode {
    fn from(row: ProjectNodeRow) -> Self {
        Self {
            id: row.object_id,
            r#type: row.object_type,
            data: NodeData {
                name: row.name,
                icon_id: row.icon_id,
                properties: from_json_str(&row.properties).unwrap(),
                methods: from_json_str(&row.methods).unwrap(),
            },
        }
    }
}

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = project_edge)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct ProjectEdgeRow {
    object_id: ObjectId,
    project_id: ProjectId,
    object_type: String,
    source: ObjectId,
    target: ObjectId,
    source_handle: String,
    target_handle: String,
    arrow_type: String,
    label: String,
}

#[allow(clippy::too_many_arguments)]
impl ProjectEdgeRow {
    pub fn new(
        object_id: &ObjectId,
        project_id: &ProjectId,
        object_type: &str,
        source: &ObjectId,
        target: &ObjectId,
        source_handle: &str,
        target_handle: &str,
        arrow_type: &str,
        label: &str,
    ) -> Self {
        Self {
            object_id: object_id.clone(),
            project_id: project_id.clone(),
            object_type: object_type.to_string(),
            source: source.clone(),
            target: target.clone(),
            source_handle: source_handle.to_string(),
            target_handle: target_handle.to_string(),
            arrow_type: arrow_type.to_string(),
            label: label.to_string(),
        }
    }
}

impl From<ProjectEdgeRow> for ProjectEdge {
    fn from(row: ProjectEdgeRow) -> Self {
        Self {
            id: row.object_id,
            r#type: row.object_type,
            source: row.source,
            target: row.target,
            source_handle: row.source_handle,
            target_handle: row.target_handle,
            marker_end: row.arrow_type.clone(),
            data: EdgeData { arrow_type: row.arrow_type, label: row.label },
        }
    }
}

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = node_icon)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct NodeIconRow {
    project_id: ProjectId,
    id: String,
    preview: String,
    desc: String,
    color: String,
}

impl From<NodeIconRow> for NodeIcon {
    fn from(row: NodeIconRow) -> Self {
        Self { id: row.id, preview: row.preview, desc: row.desc, color: row.color }
    }
}
