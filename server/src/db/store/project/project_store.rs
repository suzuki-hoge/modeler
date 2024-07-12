use diesel::dsl::count;
use diesel::insert_into;
use diesel::prelude::*;

use crate::data::project::ProjectId;
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
