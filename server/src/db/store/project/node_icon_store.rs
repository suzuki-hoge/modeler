use diesel::prelude::*;
use itertools::Itertools;

use crate::data::node::NodeIcon;
use crate::data::project::ProjectId;
use crate::db::schema::node_icon as schema;
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

pub fn find_node_icons(mut conn: Conn, project_id: &ProjectId) -> Result<Vec<NodeIcon>, String> {
    let rows = schema::table
        .filter(schema::project_id.eq(project_id))
        .select(Row::as_select())
        .load(&mut conn)
        .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(read).collect_vec())
}
