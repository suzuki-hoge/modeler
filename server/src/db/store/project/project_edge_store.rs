use diesel::mysql::Mysql;
use diesel::prelude::*;
use diesel::query_builder::QueryFragment;
use diesel::{delete, insert_into, update};
use itertools::Itertools;

use crate::data::edge::{EdgeData, ProjectEdge};
use crate::data::project::ProjectId;
use crate::data::ObjectId;
use crate::db::schema::project_edge as schema;
use crate::db::Conn;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
struct Row {
    object_id: ObjectId,
    project_id: ProjectId,
    source: ObjectId,
    target: ObjectId,
    arrow_type: String,
    label: String,
}

fn read(row: Row) -> ProjectEdge {
    ProjectEdge {
        id: row.object_id,
        r#type: String::from("class"),
        source: row.source,
        target: row.target,
        marker_end: row.arrow_type.clone(),
        data: EdgeData { arrow_type: row.arrow_type, label: row.label },
    }
}

pub fn find_project_edges(mut conn: Conn, project_id: &ProjectId) -> Result<Vec<ProjectEdge>, String> {
    let rows = schema::table
        .filter(schema::project_id.eq(project_id))
        .select(Row::as_select())
        .load(&mut conn)
        .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(read).collect_vec())
}

pub fn create_project_edge(
    mut conn: Conn,
    object_id: ObjectId,
    project_id: ProjectId,
    source: ObjectId,
    target: ObjectId,
    arrow_type: String,
    label: String,
) -> Result<(), String> {
    let row = Row { object_id, project_id, source, target, arrow_type, label };

    insert_into(schema::table).values(&row).execute(&mut conn).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn update_project_edge_connection(
    conn: Conn,
    object_id: &ObjectId,
    source: ObjectId,
    target: ObjectId,
) -> Result<(), String> {
    update_project_edge(conn, object_id, (schema::source.eq(source), schema::target.eq(target)))
}

pub fn update_project_edge_arrow_type(conn: Conn, object_id: &ObjectId, arrow_type: String) -> Result<(), String> {
    update_project_edge(conn, object_id, schema::arrow_type.eq(arrow_type))
}

pub fn update_project_edge_label(conn: Conn, object_id: &ObjectId, label: String) -> Result<(), String> {
    update_project_edge(conn, object_id, schema::label.eq(label))
}

fn update_project_edge<V>(mut conn: Conn, object_id: &ObjectId, value: V) -> Result<(), String>
where
    V: AsChangeset<Target = schema::table> + 'static,
    <V as AsChangeset>::Changeset: QueryFragment<Mysql> + 'static,
{
    let count = update(schema::table.find(object_id)).set(value).execute(&mut conn).map_err(|e| e.to_string())?;

    match count {
        1 => Ok(()),
        _ => Err(format!("unexpected update: [ {} rows found ]", count)),
    }
}

pub fn delete_project_edge(mut conn: Conn, object_id: &ObjectId) -> Result<(), String> {
    delete(schema::table.find(object_id)).execute(&mut conn).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::db::create_connection_pool;
    use crate::db::store::project::project_edge_store::{
        create_project_edge, delete_project_edge, find_project_edges, update_project_edge_arrow_type,
        update_project_edge_connection, update_project_edge_label,
    };
    use crate::db::store::project::project_node_store::create_project_node;
    use crate::db::store::project::project_store::create_project;
    use diesel::sql_types::Text;
    use diesel::{sql_query, RunQueryDsl};
    use uuid::Uuid;

    #[test]
    fn test() {
        // init
        let pool = create_connection_pool().unwrap();

        // setup keys
        let object_id = Uuid::new_v4().to_string();
        let project_node_id1 = Uuid::new_v4().to_string();
        let project_node_id2 = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup parent table
        create_project(pool.get().unwrap(), project_id.clone(), String::from("project 1")).unwrap();
        create_project_node(
            pool.get().unwrap(),
            project_node_id1.clone(),
            project_id.clone(),
            String::from("node 1"),
            String::from("icon 1"),
        )
        .unwrap();
        create_project_node(
            pool.get().unwrap(),
            project_node_id2.clone(),
            project_id.clone(),
            String::from("node 2"),
            String::from("icon 2"),
        )
        .unwrap();

        // find
        let rows = find_project_edges(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(0, rows.len());

        // create
        create_project_edge(
            pool.get().unwrap(),
            object_id.clone(),
            project_id.clone(),
            project_node_id1.clone(),
            project_node_id2.clone(),
            String::from("arrow 1"),
            String::from("1"),
        )
        .unwrap();

        // find
        let rows = find_project_edges(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(1, rows.len());
        assert_eq!(&project_node_id1, &rows[0].source);
        assert_eq!(&project_node_id2, &rows[0].target);
        assert_eq!("arrow 1", &rows[0].marker_end);
        assert_eq!("arrow 1", &rows[0].data.arrow_type);
        assert_eq!("1", &rows[0].data.label);

        // update connection
        update_project_edge_connection(
            pool.get().unwrap(),
            &object_id,
            project_node_id2.clone(),
            project_node_id1.clone(),
        )
        .unwrap();

        // find
        let rows = find_project_edges(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(&project_node_id2, &rows[0].source);
        assert_eq!(&project_node_id1, &rows[0].target);

        // update arrow type
        update_project_edge_arrow_type(pool.get().unwrap(), &object_id, String::from("arrow 2")).unwrap();

        // find
        let rows = find_project_edges(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!("arrow 2", &rows[0].data.arrow_type);

        // update label
        update_project_edge_label(pool.get().unwrap(), &object_id, String::from("0..1")).unwrap();

        // find
        let rows = find_project_edges(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!("0..1", &rows[0].data.label);

        // delete
        delete_project_edge(pool.get().unwrap(), &object_id).unwrap();

        // find
        let rows = find_project_edges(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(0, rows.len());

        // clean up
        sql_query("delete from project where project_id = ?")
            .bind::<Text, _>(&project_id)
            .execute(&mut pool.get().unwrap())
            .unwrap();
    }
}
