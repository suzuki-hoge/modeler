use diesel::dsl::count;
use diesel::insert_into;
use diesel::prelude::*;
use itertools::Itertools;

use crate::data::project::{Project, ProjectId};
use crate::db::schema::project as schema;
use crate::db::store::DatabaseError;
use crate::db::Conn;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
struct Row {
    project_id: ProjectId,
    name: String,
}

fn read(row: Row) -> Project {
    Project { project_id: row.project_id, name: row.name }
}

pub fn find_all(conn: &mut Conn) -> Result<Vec<Project>, DatabaseError> {
    let rows =
        schema::table.select(Row::as_select()).order_by(schema::name.asc()).load(conn).map_err(DatabaseError::other)?;

    Ok(rows.into_iter().map(read).collect_vec())
}

pub fn create_project(conn: &mut Conn, project_id: &ProjectId, name: &String) -> Result<(), DatabaseError> {
    let row = Row { project_id: project_id.clone(), name: name.clone() };

    insert_into(schema::table).values(&row).execute(conn).map_err(DatabaseError::other)?;

    Ok(())
}

pub fn exists(conn: &mut Conn, project_id: &ProjectId) -> Result<(), DatabaseError> {
    let count: i64 = schema::table
        .filter(schema::project_id.eq(project_id))
        .select(count(schema::project_id))
        .first(conn)
        .map_err(DatabaseError::other)?;

    if count == 0 {
        Err(DatabaseError::InvalidKey)
    } else {
        Ok(())
    }
}
