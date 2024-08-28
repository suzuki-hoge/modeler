use diesel::prelude::*;

use crate::data::node::NodeIcon;
use crate::data::project::ProjectId;
use crate::db::schema::node_icon;
use crate::db::store::project::model::NodeIconRow;
use crate::db::Conn;

pub fn find(conn: &mut Conn, project_id: &ProjectId) -> Result<Vec<NodeIcon>, String> {
    node_icon::table
        .filter(node_icon::project_id.eq(project_id))
        .load::<NodeIconRow>(conn)
        .map(|row| row.into_iter().map(NodeIcon::from).collect())
        .map_err(|e| e.to_string())
}
