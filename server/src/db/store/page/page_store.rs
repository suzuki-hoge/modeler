use diesel::dsl::count;
use diesel::insert_into;
use diesel::prelude::*;
use itertools::Itertools;

use crate::data::page::{Page, PageId};
use crate::data::project::ProjectId;
use crate::db::Conn;
use crate::db::schema::page as schema;
use crate::db::store::DatabaseError;
use crate::db::store::project::project_store;

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

pub fn find_page(conn: &mut Conn, page_id: &PageId) -> Result<Page, DatabaseError> {
    let rows = schema::table
        .filter(schema::page_id.eq(page_id))
        .select(Row::as_select())
        .order_by(schema::name.asc())
        .load(conn)
        .map_err(DatabaseError::other)?;
    let len = rows.len();

    rows.into_iter().map(read).next().ok_or(DatabaseError::unexpected_row_matched(len))
}

pub fn find_pages(conn: &mut Conn, project_id: &ProjectId) -> Result<Vec<Page>, DatabaseError> {
    project_store::exists(conn, project_id)?;

    let rows = schema::table
        .filter(schema::project_id.eq(project_id))
        .select(Row::as_select())
        .order_by(schema::name.asc())
        .load(conn)
        .map_err(DatabaseError::other)?;

    Ok(rows.into_iter().map(read).collect_vec())
}

pub fn exists(conn: &mut Conn, page_id: &PageId) -> Result<(), DatabaseError> {
    let count: i64 = schema::table
        .filter(schema::page_id.eq(page_id))
        .select(count(schema::project_id))
        .first(conn)
        .map_err(DatabaseError::other)?;

    if count == 0 {
        Err(DatabaseError::InvalidKey)
    } else {
        Ok(())
    }
}

#[allow(dead_code)]
pub fn create_page(conn: &mut Conn, page_id: &PageId, project_id: &ProjectId, name: &str) -> Result<(), DatabaseError> {
    let row = Row { page_id: page_id.clone(), project_id: project_id.clone(), name: name.to_string() };

    insert_into(schema::table).values(&row).execute(conn).map_err(DatabaseError::other)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use diesel::{RunQueryDsl, sql_query};
    use diesel::sql_types::Text;
    use uuid::Uuid;

    use crate::db::create_connection_pool;
    use crate::db::store::DatabaseError;
    use crate::db::store::page::page_store::{create_page, find_pages};
    use crate::db::store::project::project_store::create_project;

    fn s(value: &'static str) -> String {
        String::from(value)
    }

    #[test]
    fn test() -> Result<(), DatabaseError> {
        // init
        let mut conn = create_connection_pool().unwrap().get().unwrap();

        // setup keys
        let page_id = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup tables
        create_project(&mut conn, &project_id, &s("project 1"))?;

        // find
        let rows = find_pages(&mut conn, &project_id)?;
        assert_eq!(0, rows.len());

        // create
        create_page(&mut conn, &page_id, &project_id, &s("project 1"))?;

        // find
        let rows = find_pages(&mut conn, &project_id)?;
        assert_eq!(1, rows.len());
        assert_eq!("project 1", &rows[0].name);

        // clean up
        sql_query("delete from project where project_id = ?").bind::<Text, _>(&project_id).execute(&mut conn).unwrap();

        Ok(())
    }
}
