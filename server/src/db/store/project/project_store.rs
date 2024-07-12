use diesel::insert_into;
use diesel::prelude::*;

use crate::data::project::ProjectId;
use crate::db::schema::project as schema;
use crate::db::Conn;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
struct Row {
    project_id: ProjectId,
    name: String,
}

pub fn create_project(mut conn: Conn, project_id: ProjectId, name: String) -> Result<(), String> {
    let row = Row { project_id, name };

    insert_into(schema::table).values(&row).execute(&mut conn).map_err(|e| e.to_string())?;

    Ok(())
}
