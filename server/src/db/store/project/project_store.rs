use diesel::prelude::*;
use itertools::Itertools;

use crate::data::project::Project;
use crate::db::schema::project::dsl::project;
use crate::db::Conn;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::db::schema::project)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
#[derive(Debug)]
struct ProjectRow {
    id: String,
    name: String,
}

impl ProjectRow {
    // fn write(value: Project) -> Self {
    //     Self { id: value.project_id, name: value.name }
    // }

    fn read(self) -> Project {
        Project { project_id: self.id, name: self.name }
    }
}

pub fn find_all(mut conn: Conn) -> Result<Vec<Project>, String> {
    let rows: Vec<ProjectRow> = project.select(ProjectRow::as_select()).load(&mut conn).map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|row| row.read()).collect_vec())
}
