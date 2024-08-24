use diesel::mysql::Mysql;
use diesel::prelude::*;
use diesel::query_builder::QueryFragment;
use diesel::{delete, insert_into, update};
use itertools::Itertools;

use crate::data::edge::{EdgeData, ProjectEdge};
use crate::data::project::ProjectId;
use crate::data::ObjectId;
use crate::db::schema::project_edge as schema;
use crate::db::store::project::project_store;
use crate::db::store::DatabaseError;
use crate::db::Conn;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
struct Row {
    object_id: ObjectId,
    project_id: ProjectId,
    object_type: String,
    source: ObjectId,
    target: ObjectId,
    source_handle: String,
    target_handle: String,
    arrow_type: String,
    label: String,
}

fn read(row: Row) -> ProjectEdge {
    ProjectEdge {
        id: row.object_id,
        r#type: row.object_type,
        source: row.source,
        target: row.target,
        source_handle: row.source_handle,
        target_handle: row.target_handle,
        marker_end: row.arrow_type.clone(),
        data: EdgeData { arrow_type: row.arrow_type, label: row.label },
    }
}

pub fn find_project_edges(conn: &mut Conn, project_id: &ProjectId) -> Result<Vec<ProjectEdge>, DatabaseError> {
    project_store::exists(conn, project_id)?;

    let rows = schema::table
        .filter(schema::project_id.eq(project_id))
        .select(Row::as_select())
        .load(conn)
        .map_err(DatabaseError::other)?;

    Ok(rows.into_iter().map(read).collect_vec())
}

#[allow(clippy::too_many_arguments)]
pub fn create_project_edge(
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
    let row = Row {
        object_id: object_id.clone(),
        project_id: project_id.clone(),
        object_type: object_type.to_string(),
        source: source.clone(),
        target: target.clone(),
        source_handle: source_handle.to_string(),
        target_handle: target_handle.to_string(),
        arrow_type: arrow_type.to_string(),
        label: label.to_string(),
    };

    insert_into(schema::table).values(&row).execute(conn).map_err(DatabaseError::other)?;

    Ok(())
}

pub fn update_project_edge_connection(
    conn: &mut Conn,
    object_id: &ObjectId,
    source: &ObjectId,
    target: &ObjectId,
) -> Result<(), DatabaseError> {
    update_project_edge(conn, object_id, (schema::source.eq(source.clone()), schema::target.eq(target.clone())))
}

pub fn update_project_edge_arrow_type(
    conn: &mut Conn,
    object_id: &ObjectId,
    arrow_type: &str,
) -> Result<(), DatabaseError> {
    update_project_edge(conn, object_id, schema::arrow_type.eq(arrow_type.to_string()))
}

pub fn update_project_edge_label(conn: &mut Conn, object_id: &ObjectId, label: &str) -> Result<(), DatabaseError> {
    update_project_edge(conn, object_id, schema::label.eq(label.to_string()))
}

fn update_project_edge<V>(conn: &mut Conn, object_id: &ObjectId, value: V) -> Result<(), DatabaseError>
where
    V: AsChangeset<Target = schema::table> + 'static,
    <V as AsChangeset>::Changeset: QueryFragment<Mysql> + 'static,
{
    let count = update(schema::table.find(object_id)).set(value).execute(conn).map_err(DatabaseError::other)?;

    match count {
        1 => Ok(()),
        _ => Err(DatabaseError::unexpected_row_matched(count)),
    }
}

pub fn delete_project_edge(conn: &mut Conn, object_id: &ObjectId) -> Result<(), DatabaseError> {
    delete(schema::table.find(object_id)).execute(conn).map_err(DatabaseError::other)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use diesel::sql_types::Text;
    use diesel::{sql_query, RunQueryDsl};
    use uuid::Uuid;

    use crate::db::create_connection_pool;
    use crate::db::store::project::project_edge_store::{
        create_project_edge, delete_project_edge, find_project_edges, update_project_edge_arrow_type,
        update_project_edge_connection, update_project_edge_label,
    };
    use crate::db::store::project::project_node_store::create_project_node;
    use crate::db::store::project::project_store::create_project;
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
        create_project(&mut conn, &project_id, &s("project 1"))?;
        create_project_node(&mut conn, &node_id1, &project_id, &s("class"), &s("node 1"), &s("icon 1"))?;
        create_project_node(&mut conn, &node_id2, &project_id, &s("class"), &s("node 2"), &s("icon 2"))?;

        // find
        let rows = find_project_edges(&mut conn, &project_id)?;
        assert_eq!(0, rows.len());

        // create
        create_project_edge(
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
        let rows = find_project_edges(&mut conn, &project_id)?;
        assert_eq!(1, rows.len());
        assert_eq!(&node_id1, &rows[0].source);
        assert_eq!(&node_id2, &rows[0].target);
        assert_eq!("arrow 1", &rows[0].marker_end);
        assert_eq!("arrow 1", &rows[0].data.arrow_type);
        assert_eq!("1", &rows[0].data.label);

        // update connection
        update_project_edge_connection(&mut conn, &object_id, &node_id2, &node_id1)?;

        // find
        let rows = find_project_edges(&mut conn, &project_id)?;
        assert_eq!(&node_id2, &rows[0].source);
        assert_eq!(&node_id1, &rows[0].target);

        // update arrow type
        update_project_edge_arrow_type(&mut conn, &object_id, &s("arrow 2"))?;

        // find
        let rows = find_project_edges(&mut conn, &project_id)?;
        assert_eq!("arrow 2", &rows[0].data.arrow_type);

        // update label
        update_project_edge_label(&mut conn, &object_id, &s("0..1"))?;

        // find
        let rows = find_project_edges(&mut conn, &project_id)?;
        assert_eq!("0..1", &rows[0].data.label);

        // delete
        delete_project_edge(&mut conn, &object_id)?;

        // find
        let rows = find_project_edges(&mut conn, &project_id)?;
        assert_eq!(0, rows.len());

        // clean up
        sql_query("delete from project where project_id = ?").bind::<Text, _>(&project_id).execute(&mut conn).unwrap();

        Ok(())
    }
}
