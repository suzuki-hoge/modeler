use diesel::prelude::*;
use itertools::Itertools;
use crate::data::project::Project;

use crate::db::get_connection;
use crate::db::schema::project::dsl::project;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::db::schema::project)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
#[derive(Debug)]
struct ProjectRow {
    id: String,
    name: String,
}

impl From<Project> for ProjectRow {
    fn from(value: Project) -> Self {
        Self { id: value.project_id, name:value.name }
    }
}

impl Into<Project> for ProjectRow {
    fn into(self) -> Project {
        Project { project_id: self.id, name:self.name }
    }
}

pub fn find_all() -> Result<Vec<Project>, String> {
    let mut connection = get_connection()?;

    let rows: Vec<ProjectRow> =
        project.select(ProjectRow::as_select()).load(&mut connection).map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|row|row.into()).collect_vec())
}