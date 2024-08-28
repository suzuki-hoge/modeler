use diesel::dsl::count;
use diesel::insert_into;
use diesel::prelude::*;

use crate::data::project::{Project, ProjectId};
use crate::db::schema::project;
use crate::db::store::project::model::ProjectRow;
use crate::db::store::DatabaseError;
use crate::db::Conn;

pub fn find(conn: &mut Conn) -> Result<Vec<Project>, DatabaseError> {
    project::table
        .load::<ProjectRow>(conn)
        .map(|row| row.into_iter().map(Project::from).collect())
        .map_err(DatabaseError::other)
}

#[allow(dead_code)]
pub fn insert(conn: &mut Conn, project_id: &ProjectId, name: &str) -> Result<(), DatabaseError> {
    let row = ProjectRow::new(project_id, name);

    insert_into(project::table).values(&row).execute(conn).map_err(DatabaseError::other)?;

    Ok(())
}

#[allow(dead_code)]
pub fn exists(conn: &mut Conn, project_id: &ProjectId) -> Result<(), DatabaseError> {
    let count: i64 = project::table
        .filter(project::project_id.eq(project_id))
        .select(count(project::project_id))
        .first(conn)
        .map_err(DatabaseError::other)?;

    if count == 0 {
        Err(DatabaseError::InvalidKey)
    } else {
        Ok(())
    }
}
