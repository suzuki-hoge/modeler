use diesel::insert_into;
use diesel::prelude::*;

use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::db::schema::page;
use crate::db::store::page::model::PageRow;
use crate::db::Conn;

pub fn find_name(conn: &mut Conn, page_id: &PageId) -> Result<String, String> {
    page::table.find(page_id).first::<PageRow>(conn).map(|row| row.name).map_err(|e| e.to_string())
}

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
        project_store::create(&mut conn, &project_id, &s("project 1"))?;

        // insert
        page_store::create(&mut conn, &page_id, &project_id, &s("page 1"))?;

        // find
        let name = page_store::find_name(&mut conn, &page_id)?;
        assert_eq!("page 1", &name);

        Ok(())
    }
}
