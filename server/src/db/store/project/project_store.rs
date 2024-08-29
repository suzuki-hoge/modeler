use diesel::dsl::count;
use diesel::insert_into;
use diesel::prelude::*;

use crate::data::project::{Project, ProjectId};
use crate::db::schema::project;
use crate::db::store::project::model::ProjectRow;
use crate::db::Conn;

pub fn find(conn: &mut Conn) -> Result<Vec<Project>, String> {
    project::table
        .load::<ProjectRow>(conn)
        .map(|row| row.into_iter().map(Project::from).collect())
        .map_err(|e| e.to_string())
}

#[allow(dead_code)]
pub fn insert(conn: &mut Conn, project_id: &ProjectId, name: &str) -> Result<(), String> {
    let row = ProjectRow::new(project_id, name);
    insert_into(project::table).values(&row).execute(conn).map_err(|e| e.to_string())?;

    Ok(())
}

#[allow(dead_code)]
pub fn exists(conn: &mut Conn, project_id: &ProjectId) -> Result<(), String> {
    let count: i64 = project::table
        .filter(project::project_id.eq(project_id))
        .select(count(project::project_id))
        .first(conn)
        .map_err(|e| e.to_string())?;

    if count == 0 {
        Err("fixme".to_string())
    } else {
        Ok(())
    }
}
