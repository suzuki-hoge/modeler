use diesel::prelude::*;
use diesel::{delete, insert_into};
use itertools::Itertools;

use crate::data::edge::PageEdge;
use crate::data::page::PageId;
use crate::data::ObjectId;
use crate::db::schema::page_edge as schema;
use crate::db::store::page::page_store;
use crate::db::store::DatabaseError;
use crate::db::Conn;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
struct Row {
    object_id: String,
    page_id: String,
    source: ObjectId,
    target: ObjectId,
}

fn read(row: Row) -> PageEdge {
    PageEdge { id: row.object_id, r#type: String::from("class"), source: row.source, target: row.target }
}

pub fn find_page_edges(conn: &mut Conn, page_id: &PageId) -> Result<Vec<PageEdge>, DatabaseError> {
    page_store::exists(conn, page_id)?;

    let rows = schema::table
        .filter(schema::page_id.eq(page_id))
        .select(Row::as_select())
        .load(conn)
        .map_err(DatabaseError::other)?;

    Ok(rows.into_iter().map(read).collect_vec())
}

pub fn create_page_edge(
    conn: &mut Conn,
    object_id: &ObjectId,
    page_id: &PageId,
    source: &ObjectId,
    target: &ObjectId,
) -> Result<(), DatabaseError> {
    let row =
        Row { object_id: object_id.clone(), page_id: page_id.clone(), source: source.clone(), target: target.clone() };

    insert_into(schema::table).values(&row).execute(conn).map_err(DatabaseError::other)?;

    Ok(())
}

pub fn delete_page_edge(conn: &mut Conn, object_id: &ObjectId, page_id: &PageId) -> Result<(), DatabaseError> {
    delete(schema::table.find((object_id, page_id))).execute(conn).map_err(DatabaseError::other)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use diesel::sql_types::Text;
    use diesel::{sql_query, RunQueryDsl};
    use uuid::Uuid;

    use crate::db::create_connection_pool;
    use crate::db::store::page::page_edge_store::{create_page_edge, delete_page_edge, find_page_edges};
    use crate::db::store::page::page_store::create_page;
    use crate::db::store::project::project_edge_store::create_project_edge;
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
        let page_id = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup parent table
        create_project(&mut conn, &project_id, &s("project 1"))?;
        create_page(&mut conn, &page_id, &project_id, &s("project 1"))?;
        create_project_node(&mut conn, &node_id1, &project_id, &s("node 1"), &s("icon 1"))?;
        create_project_node(&mut conn, &node_id2, &project_id, &s("node 2"), &s("icon 2"))?;
        create_project_edge(&mut conn, &object_id, &project_id, &node_id1, &node_id2, &s("simple"), &s("1"))?;

        // find
        let rows = find_page_edges(&mut conn, &page_id)?;
        assert_eq!(0, rows.len());

        // create
        create_page_edge(&mut conn, &object_id, &page_id, &node_id1, &node_id2)?;

        // find
        let rows = find_page_edges(&mut conn, &page_id)?;
        assert_eq!(1, rows.len());
        assert_eq!(&node_id1, &rows[0].source);
        assert_eq!(&node_id2, &rows[0].target);

        // delete
        delete_page_edge(&mut conn, &object_id, &page_id)?;

        // find
        let rows = find_page_edges(&mut conn, &page_id)?;
        assert_eq!(0, rows.len());

        // clean up
        sql_query("delete from project where project_id = ?").bind::<Text, _>(&project_id).execute(&mut conn).unwrap();

        Ok(())
    }
}
