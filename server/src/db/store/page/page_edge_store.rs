use diesel::prelude::*;
use diesel::{delete, insert_into};
use itertools::Itertools;

use crate::data::edge::PageEdge;
use crate::data::page::PageId;
use crate::data::ObjectId;
use crate::db::schema::page_edge as schema;
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

pub fn find_page_edges(mut conn: Conn, page_id: &PageId) -> Result<Vec<PageEdge>, String> {
    let rows = schema::table
        .filter(schema::page_id.eq(page_id))
        .select(Row::as_select())
        .load(&mut conn)
        .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(read).collect_vec())
}

pub fn create_page_edge(
    mut conn: Conn,
    object_id: ObjectId,
    page_id: PageId,
    source: ObjectId,
    target: ObjectId,
) -> Result<(), String> {
    let row = Row { object_id, page_id, source, target };

    insert_into(schema::table).values(&row).execute(&mut conn).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn delete_page_edge(mut conn: Conn, object_id: &ObjectId, page_id: &PageId) -> Result<(), String> {
    delete(schema::table.find((object_id, page_id))).execute(&mut conn).map_err(|e| e.to_string())?;

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

    #[test]
    fn test() {
        // init
        let pool = create_connection_pool().unwrap();

        // setup keys
        let object_id = Uuid::new_v4().to_string();
        let project_node_id1 = Uuid::new_v4().to_string();
        let project_node_id2 = Uuid::new_v4().to_string();
        let page_id = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup parent table
        create_project(pool.get().unwrap(), project_id.clone(), String::from("project 1")).unwrap();
        create_page(pool.get().unwrap(), page_id.clone(), project_id.clone(), String::from("project 1")).unwrap();
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
        create_project_edge(
            pool.get().unwrap(),
            object_id.clone(),
            project_id.clone(),
            project_node_id1.clone(),
            project_node_id2.clone(),
            String::from("simple"),
            String::from("1"),
        )
        .unwrap();

        // find
        let rows = find_page_edges(pool.get().unwrap(), &page_id).unwrap();
        assert_eq!(0, rows.len());

        // create
        create_page_edge(
            pool.get().unwrap(),
            object_id.clone(),
            page_id.clone(),
            project_node_id1.clone(),
            project_node_id2.clone(),
        )
        .unwrap();

        // find
        let rows = find_page_edges(pool.get().unwrap(), &page_id).unwrap();
        assert_eq!(1, rows.len());
        assert_eq!(&project_node_id1, &rows[0].source);
        assert_eq!(&project_node_id2, &rows[0].target);

        // delete
        delete_page_edge(pool.get().unwrap(), &object_id, &page_id).unwrap();

        // find
        let rows = find_page_edges(pool.get().unwrap(), &page_id).unwrap();
        assert_eq!(0, rows.len());

        // clean up
        sql_query("delete from project where project_id = ?")
            .bind::<Text, _>(&project_id)
            .execute(&mut pool.get().unwrap())
            .unwrap();
    }
}
