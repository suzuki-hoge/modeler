use diesel::insert_into;
use diesel::prelude::*;

use crate::data::project::ProjectId;
use crate::db::schema::project;
use crate::db::store::project::model::ProjectRow;
use crate::db::Conn;

pub fn create(conn: &mut Conn, project_id: &ProjectId, name: &str) -> Result<(), String> {
    let row = ProjectRow::new(project_id, name);
    insert_into(project::table).values(&row).execute(conn).map_err(|e| e.to_string())?;

    Ok(())
}
