use diesel::insert_into;
use diesel::mysql::Mysql;
use diesel::prelude::*;
use diesel::query_builder::QueryFragment;

use crate::data::edge::ProjectEdge;
use crate::data::project::ProjectId;
use crate::data::ObjectId;
use crate::db::schema::project_edge;
use crate::db::store::project::model::ProjectEdgeRow;
use crate::db::store::DatabaseError;
use crate::db::Conn;

pub fn find(conn: &mut Conn, project_id: &ProjectId) -> Result<Vec<ProjectEdge>, DatabaseError> {
    project_edge::table
        .filter(project_edge::project_id.eq(project_id))
        .load::<ProjectEdgeRow>(conn)
        .map(|row| row.into_iter().map(ProjectEdge::from).collect())
        .map_err(DatabaseError::other)
}

#[allow(clippy::too_many_arguments)]
pub fn create(
    conn: &mut Conn,
    object_id: &ObjectId,
    project_id: &ProjectId,
    object_type: &str,
    source: &ObjectId,
    target: &ObjectId,
    source_handle: &str,
    target_handle: &str,
    arrow_type: &str,
    label: &str,
) -> Result<(), DatabaseError> {
    let row = ProjectEdgeRow::new(
        object_id,
        project_id,
        object_type,
        source,
        target,
        source_handle,
        target_handle,
        arrow_type,
        label,
    );

    insert_into(project_edge::table).values(&row).execute(conn).map_err(DatabaseError::other)?;

    Ok(())
}

pub fn update_connection(
    conn: &mut Conn,
    object_id: &ObjectId,
    source: &ObjectId,
    target: &ObjectId,
) -> Result<(), DatabaseError> {
    update(conn, object_id, (project_edge::source.eq(source.clone()), project_edge::target.eq(target.clone())))
}

pub fn update_arrow_type(conn: &mut Conn, object_id: &ObjectId, arrow_type: &str) -> Result<(), DatabaseError> {
    update(conn, object_id, project_edge::arrow_type.eq(arrow_type.to_string()))
}

pub fn update_label(conn: &mut Conn, object_id: &ObjectId, label: &str) -> Result<(), DatabaseError> {
    update(conn, object_id, project_edge::label.eq(label.to_string()))
}

fn update<V>(conn: &mut Conn, object_id: &ObjectId, value: V) -> Result<(), DatabaseError>
where
    V: AsChangeset<Target = project_edge::table> + 'static,
    <V as AsChangeset>::Changeset: QueryFragment<Mysql> + 'static,
{
    let count =
        diesel::update(project_edge::table.find(object_id)).set(value).execute(conn).map_err(DatabaseError::other)?;

    match count {
        1 => Ok(()),
        _ => Err(DatabaseError::unexpected_row_matched(count)),
    }
}

pub fn delete(conn: &mut Conn, object_id: &ObjectId) -> Result<(), DatabaseError> {
    diesel::delete(project_edge::table.find(object_id)).execute(conn).map_err(DatabaseError::other)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use diesel::sql_types::Text;
    use diesel::{sql_query, RunQueryDsl};
    use uuid::Uuid;

    use crate::db::create_connection_pool;
    use crate::db::store::project::{project_edge_store, project_node_store, project_store};
    use crate::db::store::DatabaseError;

    fn s(value: &'static str) -> String {
        String::from(value)
    }

    #[test]
    fn test() -> Result<(), DatabaseError> {
        // init
        let mut conn = create_connection_pool().unwrap().get().unwrap();

        // setup keys
        let object_id = Uuid::new_v4().to_string();
        let node_id1 = Uuid::new_v4().to_string();
        let node_id2 = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup parent table
        project_store::insert(&mut conn, &project_id, &s("project 1"))?;
        project_node_store::insert(&mut conn, &node_id1, &project_id, &s("class"), &s("node 1"), &s("icon 1"))?;
        project_node_store::insert(&mut conn, &node_id2, &project_id, &s("class"), &s("node 2"), &s("icon 2"))?;

        // find
        let rows = project_edge_store::find(&mut conn, &project_id)?;
        assert_eq!(0, rows.len());

        // create
        project_edge_store::create(
            &mut conn,
            &object_id,
            &project_id,
            &s("class"),
            &node_id1,
            &node_id2,
            &s("center"),
            &s("center"),
            &s("arrow 1"),
            &s("1"),
        )?;

        // find
        let rows = project_edge_store::find(&mut conn, &project_id)?;
        assert_eq!(1, rows.len());
        assert_eq!(&node_id1, &rows[0].source);
        assert_eq!(&node_id2, &rows[0].target);
        assert_eq!("arrow 1", &rows[0].marker_end);
        assert_eq!("arrow 1", &rows[0].data.arrow_type);
        assert_eq!("1", &rows[0].data.label);

        // update connection
        project_edge_store::update_connection(&mut conn, &object_id, &node_id2, &node_id1)?;

        // find
        let rows = project_edge_store::find(&mut conn, &project_id)?;
        assert_eq!(&node_id2, &rows[0].source);
        assert_eq!(&node_id1, &rows[0].target);

        // update arrow type
        project_edge_store::update_arrow_type(&mut conn, &object_id, &s("arrow 2"))?;

        // find
        let rows = project_edge_store::find(&mut conn, &project_id)?;
        assert_eq!("arrow 2", &rows[0].data.arrow_type);

        // update label
        project_edge_store::update_label(&mut conn, &object_id, &s("0..1"))?;

        // find
        let rows = project_edge_store::find(&mut conn, &project_id)?;
        assert_eq!("0..1", &rows[0].data.label);

        // delete
        project_edge_store::delete(&mut conn, &object_id)?;

        // find
        let rows = project_edge_store::find(&mut conn, &project_id)?;
        assert_eq!(0, rows.len());

        // clean up
        sql_query("delete from project where project_id = ?").bind::<Text, _>(&project_id).execute(&mut conn).unwrap();

        Ok(())
    }
}
