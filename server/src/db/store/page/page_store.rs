use diesel::prelude::*;
use itertools::Itertools;

use crate::data::page::Page;
use crate::data::project::ProjectId;
use crate::db::schema::page::dsl;
use crate::db::Conn;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::db::schema::page)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
#[derive(Debug)]
struct PageRow {
    id: String,
    project_id: String,
    name: String,
}

impl PageRow {
    // fn write(value: Page) -> Self {
    //     Self { id: value.page_id, project_id: value.project_id, name: value.name }
    // }

    fn read(self) -> Page {
        Page { page_id: self.id, project_id: self.project_id, name: self.name }
    }
}

pub fn find(mut conn: Conn, project_id: &ProjectId) -> Result<Vec<Page>, String> {
    let rows: Vec<PageRow> = dsl::page
        .filter(dsl::project_id.eq(project_id))
        .select(PageRow::as_select())
        .load(&mut conn)
        .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|row| row.read()).collect_vec())
}
