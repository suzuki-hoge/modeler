use diesel::dsl::count;
use diesel::insert_into;
use diesel::prelude::*;

use crate::data::page::{Page, PageId};
use crate::data::project::ProjectId;
use crate::db::schema::page;
use crate::db::store::page::model::PageRow;
use crate::db::Conn;

pub fn find(conn: &mut Conn, project_id: &ProjectId) -> Result<Vec<Page>, String> {
    page::table
        .filter(page::project_id.eq(project_id))
        .load::<PageRow>(conn)
        .map(|row| row.into_iter().map(Page::from).collect())
        .map_err(|e| e.to_string())
}

pub fn find_one(conn: &mut Conn, page_id: &PageId) -> Result<Page, String> {
    page::table.find(page_id).first::<PageRow>(conn).map(Page::from).map_err(|e| e.to_string())
}

#[allow(dead_code)]
pub fn exists(conn: &mut Conn, page_id: &PageId) -> Result<(), String> {
    let count: i64 = page::table
        .filter(page::page_id.eq(page_id))
        .select(count(page::project_id))
        .first(conn)
        .map_err(|e| e.to_string())?;

    if count == 0 {
        Err("foo".to_string())
    } else {
        Ok(())
    }
}

#[allow(dead_code)]
pub fn create(conn: &mut Conn, page_id: &PageId, project_id: &ProjectId, name: &str) -> Result<(), String> {
    let row = PageRow::new(page_id, project_id, name);

    insert_into(page::table).values(&row).execute(conn).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use uuid::Uuid;

    use crate::db::create_connection_pool;
    use crate::db::store::page::page_store;
    use crate::db::store::project::project_store;

    fn s(value: &'static str) -> String {
        String::from(value)
    }

    #[test]
    fn test() -> Result<(), String> {
        // init
        let mut conn = create_connection_pool().unwrap().get().unwrap();

        // setup keys
        let page_id = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup tables
        project_store::insert(&mut conn, &project_id, &s("project 1"))?;

        // find
        let rows = page_store::find(&mut conn, &project_id)?;
        assert_eq!(0, rows.len());

        // create
        page_store::create(&mut conn, &page_id, &project_id, &s("project 1"))?;

        // find
        let rows = page_store::find(&mut conn, &project_id)?;
        assert_eq!(1, rows.len());
        assert_eq!("project 1", &rows[0].name);

        Ok(())
    }
}
