use diesel::prelude::*;
use itertools::Itertools;
use serde_json::from_str as from_json_str;
use serde_json::to_string as to_json_string;

use crate::data::node::PageNode;
use crate::data::page::PageId;
use crate::data::{ObjectId, Position};
use crate::db::get_connection;
use crate::db::schema::page_node as schema;

#[derive(Queryable, Selectable, Insertable)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
#[derive(Debug)]
struct PageNodeRow {
    id: String,
    page_id: String,
    type_: String,
    position: String,
}

impl PageNodeRow {
    fn read(self) -> PageNode {
        PageNode { id: self.id, r#type: self.type_, position: from_json_str(&self.position).unwrap() }
    }

    fn write(value: PageNode, page_id: PageId) -> Self {
        Self { id: value.id, page_id, type_: value.r#type, position: to_json_string(&value.position).unwrap() }
    }

    fn write_position(value: Position) -> String {
        to_json_string(&value).unwrap()
    }
}

pub fn find(page_id: &PageId) -> Result<Vec<PageNode>, String> {
    let mut connection = get_connection()?;

    let rows: Vec<PageNodeRow> = schema::table
        .filter(schema::page_id.eq(page_id).and(schema::type_.eq("class")))
        .select(PageNodeRow::as_select())
        .load(&mut connection)
        .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|row| row.read()).collect_vec())
}

pub fn insert(value: PageNode, page_id: PageId) -> Result<(), String> {
    let mut connection = get_connection()?;

    let row = PageNodeRow::write(value, page_id);

    diesel::insert_into(schema::table).values(&row).execute(&mut connection).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn update(value: PageNode) -> Result<(), String> {
    let mut connection = get_connection()?;

    let count = diesel::update(schema::table.find(&value.id))
        .set(schema::position.eq(&PageNodeRow::write_position(value.position)))
        .execute(&mut connection)
        .map_err(|e| e.to_string())?;

    match count {
        1 => Ok(()),
        _ => Err(format!("unexpected update: [ {} rows found ]", count)),
    }
}

pub fn delete(id: ObjectId) -> Result<(), String> {
    let mut connection = get_connection()?;

    diesel::delete(schema::table.find(id)).execute(&mut connection).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use diesel::RunQueryDsl;

    use crate::data::node::PageNode;
    use crate::data::Position;
    use crate::db::get_connection;
    use crate::db::store::page::node_store::{delete, find, insert, update};

    #[test]
    fn test() {
        // setup
        let mut connection = get_connection().unwrap();
        diesel::sql_query("delete from page_node").execute(&mut connection).unwrap();
        // fixme: write in test
        let page_id1 = String::from("3313e913-b0ab-4e3b-a35f-f1cf8ab625e1");
        let page_id2 = String::from("1c672dc5-6951-4712-a345-86f60f28a7b2");

        // find
        let rows1 = find(&page_id1).unwrap();
        assert_eq!(0, rows1.len());
        let rows2 = find(&page_id2).unwrap();
        assert_eq!(0, rows2.len());

        // insert
        let row = PageNode {
            id: String::from("5e5a3441-678b-43dd-93c2-825fa0b99a2c"),
            r#type: String::from("class"),
            position: Position { x: 0.0, y: 0.0 },
        };
        insert(row.clone(), page_id1.clone()).unwrap();

        // find
        let rows1 = find(&page_id1).unwrap();
        assert_eq!(row, rows1[0]);
        let rows2 = find(&page_id2).unwrap();
        assert_eq!(0, rows2.len());

        // update
        let new_row = PageNode {
            id: String::from("5e5a3441-678b-43dd-93c2-825fa0b99a2c"),
            r#type: String::from("class"),
            position: Position { x: 1.0, y: 0.1 },
        };
        update(new_row.clone()).unwrap();

        // find
        let rows1 = find(&page_id1).unwrap();
        assert_eq!(new_row, rows1[0]);
        let rows2 = find(&page_id2).unwrap();
        assert_eq!(0, rows2.len());

        // delete
        delete(row.id).unwrap();

        // find
        let rows1 = find(&page_id1).unwrap();
        assert_eq!(0, rows1.len());
        let rows2 = find(&page_id2).unwrap();
        assert_eq!(0, rows2.len());
    }
}
