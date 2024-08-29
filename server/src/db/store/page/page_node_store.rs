use diesel::insert_into;
use diesel::prelude::*;

use crate::data::node::PageNode;
use crate::data::page::PageId;
use crate::data::ObjectId;
use crate::db::schema::page_node;
use crate::db::store::page::model::PageNodeRow;
use crate::db::Conn;

pub fn find(conn: &mut Conn, page_id: &PageId) -> Result<Vec<PageNode>, String> {
    page_node::table
        .filter(page_node::page_id.eq(page_id))
        .load::<PageNodeRow>(conn)
        .map(|row| row.into_iter().map(PageNode::from).collect())
        .map_err(|e| e.to_string())
}

pub fn insert(
    conn: &mut Conn,
    object_id: &ObjectId,
    page_id: &PageId,
    object_type: &str,
    x: f64,
    y: f64,
) -> Result<(), String> {
    let row = PageNodeRow::new(object_id, page_id, object_type, x, y);
    insert_into(page_node::table).values(&row).execute(conn).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn update_position(conn: &mut Conn, object_id: &ObjectId, page_id: &PageId, x: f64, y: f64) -> Result<(), String> {
    diesel::update(page_node::table.find((object_id, page_id)))
        .set((page_node::x.eq(x.to_string()), page_node::y.eq(y.to_string())))
        .execute(conn)
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn delete(conn: &mut Conn, object_id: &ObjectId, page_id: &PageId) -> Result<(), String> {
    diesel::delete(page_node::table.find((object_id, page_id))).execute(conn).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use uuid::Uuid;

    use crate::db::create_connection_pool;
    use crate::db::store::page::{page_node_store, page_store};
    use crate::db::store::project::{project_node_store, project_store};

    fn s(value: &'static str) -> String {
        String::from(value)
    }

    #[test]
    fn test() -> Result<(), String> {
        // init
        let mut conn = create_connection_pool().unwrap().get().unwrap();

        // setup keys
        let object_id = Uuid::new_v4().to_string();
        let page_id = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup parent table
        project_store::insert(&mut conn, &project_id, &s("project 1"))?;
        page_store::insert(&mut conn, &page_id, &project_id, &s("page 1"))?;
        project_node_store::insert(&mut conn, &object_id, &project_id, &s("class"), &s("node 1"), &s("icon 1"))?;

        // find
        let rows = page_node_store::find(&mut conn, &page_id)?;
        assert_eq!(0, rows.len());

        // insert
        page_node_store::insert(&mut conn, &object_id, &page_id, &s("class"), 1.0, 2.0)?;

        // find
        let rows = page_node_store::find(&mut conn, &page_id)?;
        assert_eq!(1, rows.len());
        assert_eq!("1", &rows[0].position.x.to_string());
        assert_eq!("2", &rows[0].position.y.to_string());

        // update name
        page_node_store::update_position(&mut conn, &object_id, &page_id, -1.2, -3.4)?;

        // find
        let rows = page_node_store::find(&mut conn, &page_id)?;
        assert_eq!("-1.2", &rows[0].position.x.to_string());
        assert_eq!("-3.4", &rows[0].position.y.to_string());

        // delete
        page_node_store::delete(&mut conn, &object_id, &page_id)?;

        // find
        let rows = page_node_store::find(&mut conn, &page_id)?;
        assert_eq!(0, rows.len());

        Ok(())
    }
}
