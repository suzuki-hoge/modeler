use diesel::insert_into;
use diesel::prelude::*;

use crate::data::edge::PageEdge;
use crate::data::page::PageId;
use crate::data::ObjectId;
use crate::db::schema::page_edge;
use crate::db::store::page::model::PageEdgeRow;
use crate::db::Conn;

pub fn find(conn: &mut Conn, page_id: &PageId) -> Result<Vec<PageEdge>, String> {
    page_edge::table
        .filter(page_edge::page_id.eq(page_id))
        .load::<PageEdgeRow>(conn)
        .map(|row| row.into_iter().map(PageEdge::from).collect())
        .map_err(|e| e.to_string())
}

#[allow(clippy::too_many_arguments)]
pub fn insert(
    conn: &mut Conn,
    object_id: &ObjectId,
    page_id: &PageId,
    object_type: &str,
    source: &ObjectId,
    target: &ObjectId,
    source_handle: &str,
    target_handle: &str,
) -> Result<(), String> {
    let row = PageEdgeRow::new(object_id, page_id, object_type, source, target, source_handle, target_handle);
    insert_into(page_edge::table).values(&row).execute(conn).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn delete(conn: &mut Conn, object_id: &ObjectId, page_id: &PageId) -> Result<(), String> {
    diesel::delete(page_edge::table.find((object_id, page_id))).execute(conn).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use uuid::Uuid;

    use crate::db::create_connection_pool;
    use crate::db::store::page::{page_edge_store, page_store};
    use crate::db::store::project::{project_edge_store, project_node_store, project_store};

    fn s(value: &'static str) -> String {
        String::from(value)
    }

    #[test]
    fn test() -> Result<(), String> {
        // init
        let mut conn = create_connection_pool().unwrap().get().unwrap();

        // setup keys
        let object_id = Uuid::new_v4().to_string();
        let node_id1 = Uuid::new_v4().to_string();
        let node_id2 = Uuid::new_v4().to_string();
        let page_id = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup parent table
        project_store::insert(&mut conn, &project_id, &s("project 1"))?;
        page_store::insert(&mut conn, &page_id, &project_id, &s("page 1"))?;
        project_node_store::insert(&mut conn, &node_id1, &project_id, &s("class"), &s("node 1"), &s("icon 1"))?;
        project_node_store::insert(&mut conn, &node_id2, &project_id, &s("class"), &s("node 2"), &s("icon 2"))?;
        project_edge_store::insert(
            &mut conn,
            &object_id,
            &project_id,
            &s("class"),
            &node_id1,
            &node_id2,
            &s("center"),
            &s("center"),
            &s("simple"),
            &s("1"),
        )?;

        // find
        let rows = page_edge_store::find(&mut conn, &page_id)?;
        assert_eq!(0, rows.len());

        // insert
        page_edge_store::insert(
            &mut conn,
            &object_id,
            &page_id,
            &s("class"),
            &node_id1,
            &node_id2,
            &s("center"),
            &s("center"),
        )?;

        // find
        let rows = page_edge_store::find(&mut conn, &page_id)?;
        assert_eq!(1, rows.len());
        assert_eq!(&node_id1, &rows[0].source);
        assert_eq!(&node_id2, &rows[0].target);

        // delete
        page_edge_store::delete(&mut conn, &object_id, &page_id)?;

        // find
        let rows = page_edge_store::find(&mut conn, &page_id)?;
        assert_eq!(0, rows.len());

        Ok(())
    }
}
