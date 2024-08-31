use diesel::insert_into;
use diesel::prelude::*;

use crate::data::project::ProjectId;
use crate::data::user::UserId;
use crate::db::schema::user_project;
use crate::db::store::user::model::UserProjectRow;
use crate::db::Conn;

pub fn create(conn: &mut Conn, user_id: &UserId, project_id: &ProjectId) -> Result<(), String> {
    let row = UserProjectRow::new(user_id, project_id);
    insert_into(user_project::table).values(&row).execute(conn).map_err(|e| e.to_string())?;

    Ok(())
}
