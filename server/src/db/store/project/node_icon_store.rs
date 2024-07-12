use diesel::prelude::*;
use itertools::Itertools;

use crate::data::node::NodeIcon;
use crate::data::project::ProjectId;
use crate::db::schema::node_icon as schema;
use crate::db::store::project::project_store;
use crate::db::store::DatabaseError;
use crate::db::Conn;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
struct Row {
    id: String,
    preview: String,
    desc: String,
    color: String,
}

fn read(row: Row) -> NodeIcon {
    NodeIcon { id: row.id, preview: row.preview, desc: row.desc, color: row.color }
}

pub fn find_node_icons(conn: &mut Conn, project_id: &ProjectId) -> Result<Vec<NodeIcon>, DatabaseError> {
    project_store::exists(conn, project_id)?;

    let rows = schema::table
        .filter(schema::project_id.eq(project_id))
        .select(Row::as_select())
        .load(conn)
        .map_err(DatabaseError::other)?;

    Ok(rows.into_iter().map(read).collect_vec())
}
