use diesel::prelude::*;
use itertools::Itertools;
use serde_json::from_str as from_json_str;
use serde_json::to_string as to_json_string;

use crate::data::node::{NodeData, ProjectNode};
use crate::data::project::ProjectId;
use crate::data::ObjectId;
use crate::db::get_connection;
use crate::db::schema::project_node as schema;

#[derive(Queryable, Selectable, Insertable)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
#[derive(Debug)]
struct ProjectNodeRow {
    id: String,
    project_id: String,
    type_: String,
    data: String,
}

impl ProjectNodeRow {
    fn read(self) -> ProjectNode {
        ProjectNode { id: self.id, r#type: self.type_, data: from_json_str(&self.data).unwrap() }
    }

    fn write(value: ProjectNode, project_id: ProjectId) -> Self {
        Self { id: value.id, project_id, type_: value.r#type, data: to_json_string(&value.data).unwrap() }
    }

    fn write_data(value: NodeData) -> String {
        to_json_string(&value).unwrap()
    }
}

pub fn find(project_id: &ProjectId) -> Result<Vec<ProjectNode>, String> {
    let mut connection = get_connection()?;

    let rows: Vec<ProjectNodeRow> = schema::table
        .filter(schema::project_id.eq(project_id).and(schema::type_.eq("class")))
        .select(ProjectNodeRow::as_select())
        .load(&mut connection)
        .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(|row| row.read()).collect_vec())
}

pub fn insert(value: ProjectNode, project_id: ProjectId) -> Result<(), String> {
    let mut connection = get_connection()?;

    let row = ProjectNodeRow::write(value, project_id);

    diesel::insert_into(schema::table).values(&row).execute(&mut connection).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn update(value: ProjectNode) -> Result<(), String> {
    let mut connection = get_connection()?;

    let count = diesel::update(schema::table.find(&value.id))
        .set(schema::data.eq(&ProjectNodeRow::write_data(value.data)))
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
    use crate::data::node::{NodeData, ProjectNode};
    use crate::db::get_connection;
    use crate::db::store::project::node_store::{delete, find, insert, update};
    use diesel::RunQueryDsl;

    #[test]
    fn test() {
        // setup
        let mut connection = get_connection().unwrap();
        diesel::sql_query("delete from project_node").execute(&mut connection).unwrap();
        // fixme: write in test
        let project_id1 = String::from("7c6174a1-d573-443b-bfd5-e918bfeffd39");
        let project_id2 = String::from("3ac1ccff-fc6c-46fb-9aa3-ab0236875160");

        // find
        let rows1 = find(&project_id1).unwrap();
        assert_eq!(0, rows1.len());
        let rows2 = find(&project_id2).unwrap();
        assert_eq!(0, rows2.len());

        // insert
        let row = ProjectNode {
            id: String::from("a8416664-f4bd-4242-a81c-78e1de298675"),
            r#type: String::from("class"),
            data: NodeData {
                icon_id: String::from("default"),
                name: String::from("Test"),
                properties: vec![String::from("p1")],
                methods: vec![String::from("m1")],
            },
        };
        insert(row.clone(), project_id1.clone()).unwrap();

        // find
        let rows1 = find(&project_id1).unwrap();
        assert_eq!(row, rows1[0]);
        let rows2 = find(&project_id2).unwrap();
        assert_eq!(0, rows2.len());

        // update
        let new_row = ProjectNode {
            id: String::from("a8416664-f4bd-4242-a81c-78e1de298675"),
            r#type: String::from("class"),
            data: NodeData {
                icon_id: String::from("default"),
                name: String::from("Test"),
                properties: vec![String::from("p2")],
                methods: vec![String::from("m2")],
            },
        };
        update(new_row.clone()).unwrap();

        // find
        let rows1 = find(&project_id1).unwrap();
        assert_eq!(new_row, rows1[0]);
        let rows2 = find(&project_id2).unwrap();
        assert_eq!(0, rows2.len());

        // delete
        delete(row.id).unwrap();

        // find
        let rows1 = find(&project_id1).unwrap();
        assert_eq!(0, rows1.len());
        let rows2 = find(&project_id2).unwrap();
        assert_eq!(0, rows2.len());
    }
}
