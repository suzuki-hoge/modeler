use diesel::insert_into;
use diesel::prelude::*;
use itertools::Itertools;

use crate::data::page::{Page, PageId};
use crate::data::project::ProjectId;
use crate::db::schema::page as schema;
use crate::db::Conn;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
struct Row {
    page_id: String,
    project_id: String,
    name: String,
}

fn read(row: Row) -> Page {
    Page { page_id: row.page_id, project_id: row.project_id, name: row.name }
}

pub fn find_pages(mut conn: Conn, project_id: &ProjectId) -> Result<Vec<Page>, String> {
    let rows = schema::table
        .filter(schema::project_id.eq(project_id))
        .select(Row::as_select())
        .load(&mut conn)
        .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(read).collect_vec())
}

pub fn create_page(mut conn: Conn, page_id: PageId, project_id: ProjectId, name: String) -> Result<(), String> {
    let row = Row { page_id, project_id, name };

    insert_into(schema::table).values(&row).execute(&mut conn).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::db::create_connection_pool;
    use crate::db::store::page::page_store::{create_page, find_pages};
    use crate::db::store::project::project_store::create_project;

    use diesel::sql_types::Text;
    use diesel::{sql_query, RunQueryDsl};
    use uuid::Uuid;

    #[test]
    fn test() {
        // init
        let pool = create_connection_pool().unwrap();

        // setup keys
        let page_id = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup tables
        create_project(pool.get().unwrap(), project_id.clone(), String::from("project 1")).unwrap();

        // find
        let rows = find_pages(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(0, rows.len());

        // create
        create_page(pool.get().unwrap(), page_id.clone(), project_id.clone(), String::from("project 1")).unwrap();

        // find
        let rows = find_pages(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(1, rows.len());
        assert_eq!("project 1", &rows[0].name);

        // clean up
        sql_query("delete from project where project_id = ?")
            .bind::<Text, _>(&project_id)
            .execute(&mut pool.get().unwrap())
            .unwrap();
    }
}
