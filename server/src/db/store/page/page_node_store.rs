use diesel::prelude::*;
use diesel::{delete, insert_into, update};
use itertools::Itertools;

use crate::data::node::PageNode;
use crate::data::page::PageId;
use crate::data::{ObjectId, Position};
use crate::db::schema::page_node as schema;
use crate::db::Conn;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
struct Row {
    object_id: String,
    page_id: String,
    x: String,
    y: String,
}

fn read(row: Row) -> PageNode {
    PageNode {
        id: row.object_id,
        r#type: String::from("class"),
        position: Position { x: row.x.parse().unwrap(), y: row.y.parse().unwrap() },
    }
}

pub fn find_page_nodes(mut conn: Conn, page_id: &PageId) -> Result<Vec<PageNode>, String> {
    let rows = schema::table
        .filter(schema::page_id.eq(page_id))
        .select(Row::as_select())
        .load(&mut conn)
        .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(read).collect_vec())
}

pub fn create_page_node(mut conn: Conn, object_id: ObjectId, page_id: PageId, x: f64, y: f64) -> Result<(), String> {
    let row = Row { object_id, page_id, x: x.to_string(), y: y.to_string() };

    insert_into(schema::table).values(&row).execute(&mut conn).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn update_page_node_position(
    mut conn: Conn,
    object_id: &ObjectId,
    page_id: &PageId,
    x: f64,
    y: f64,
) -> Result<(), String> {
    let x = x.to_string();
    let y = y.to_string();
    let count = update(schema::table.find((object_id, page_id)))
        .set((schema::x.eq(x), schema::y.eq(y)))
        .execute(&mut conn)
        .map_err(|e| e.to_string())?;

    match count {
        1 => Ok(()),
        _ => Err(format!("unexpected update: [ {} rows found ]", count)),
    }
}

pub fn delete_page_node(mut conn: Conn, object_id: &ObjectId, page_id: &PageId) -> Result<(), String> {
    delete(schema::table.find((object_id, page_id))).execute(&mut conn).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::db::create_connection_pool;
    use crate::db::store::page::page_node_store::{
        create_page_node, delete_page_node, find_page_nodes, update_page_node_position,
    };
    use crate::db::store::page::page_store::create_page;
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
        let page_id = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup parent table
        create_project(pool.get().unwrap(), project_id.clone(), String::from("project 1")).unwrap();
        create_page(pool.get().unwrap(), page_id.clone(), project_id.clone(), String::from("project 1")).unwrap();
        create_project_node(
            pool.get().unwrap(),
            object_id.clone(),
            project_id.clone(),
            String::from("node 1"),
            String::from("icon 1"),
        )
        .unwrap();

        // find
        let rows = find_page_nodes(pool.get().unwrap(), &page_id).unwrap();
        assert_eq!(0, rows.len());

        // create
        create_page_node(pool.get().unwrap(), object_id.clone(), page_id.clone(), 1.0, 2.0).unwrap();

        // find
        let rows = find_page_nodes(pool.get().unwrap(), &page_id).unwrap();
        assert_eq!(1, rows.len());
        assert_eq!("1", &rows[0].position.x.to_string());
        assert_eq!("2", &rows[0].position.y.to_string());

        // update name
        update_page_node_position(pool.get().unwrap(), &object_id, &page_id, -1.2, -3.4).unwrap();

        // find
        let rows = find_page_nodes(pool.get().unwrap(), &page_id).unwrap();
        assert_eq!("-1.2", &rows[0].position.x.to_string());
        assert_eq!("-3.4", &rows[0].position.y.to_string());

        // delete
        delete_page_node(pool.get().unwrap(), &object_id, &page_id).unwrap();

        // find
        let rows = find_page_nodes(pool.get().unwrap(), &page_id).unwrap();
        assert_eq!(0, rows.len());

        // clean up
        sql_query("delete from project where project_id = ?")
            .bind::<Text, _>(&project_id)
            .execute(&mut pool.get().unwrap())
            .unwrap();
    }
}
