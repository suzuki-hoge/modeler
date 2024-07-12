use diesel::mysql::Mysql;
use diesel::prelude::*;
use diesel::query_builder::QueryFragment;
use diesel::{delete, insert_into, update};
use itertools::Itertools;
use serde_json::from_str as from_json_str;
use serde_json::to_string as to_json_string;

use crate::data::node::{NodeData, ProjectNode};
use crate::data::project::ProjectId;
use crate::data::ObjectId;
use crate::db::schema::project_node as schema;
use crate::db::Conn;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
struct Row {
    object_id: ObjectId,
    project_id: ProjectId,
    name: String,
    icon_id: String,
    properties: String,
    methods: String,
}

fn read(row: Row) -> ProjectNode {
    ProjectNode {
        id: row.object_id,
        r#type: String::from("class"),
        data: NodeData {
            name: row.name,
            icon_id: row.icon_id,
            properties: from_json_str(&row.properties).unwrap(),
            methods: from_json_str(&row.methods).unwrap(),
        },
    }
}

pub fn find_project_nodes(mut conn: Conn, project_id: &ProjectId) -> Result<Vec<ProjectNode>, String> {
    let rows = schema::table
        .filter(schema::project_id.eq(project_id))
        .select(Row::as_select())
        .load(&mut conn)
        .map_err(|e| e.to_string())?;

    Ok(rows.into_iter().map(read).collect_vec())
}

pub fn create_project_node(
    mut conn: Conn,
    object_id: ObjectId,
    project_id: ProjectId,
    name: String,
    icon_id: String,
) -> Result<(), String> {
    let empty: Vec<String> = vec![];
    let row = Row {
        object_id,
        project_id,
        name,
        icon_id,
        properties: to_json_string(&empty).unwrap(),
        methods: to_json_string(&empty).unwrap(),
    };

    insert_into(schema::table).values(&row).execute(&mut conn).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn update_project_node_name(conn: Conn, object_id: &ObjectId, name: String) -> Result<(), String> {
    update_project_node(conn, object_id, schema::name.eq(name))
}

pub fn update_project_node_icon_id(conn: Conn, object_id: &ObjectId, icon_id: String) -> Result<(), String> {
    update_project_node(conn, object_id, schema::icon_id.eq(icon_id))
}

pub fn update_project_node_properties(conn: Conn, object_id: &ObjectId, properties: Vec<String>) -> Result<(), String> {
    let value = to_json_string(&properties).unwrap();
    update_project_node(conn, object_id, schema::properties.eq(value))
}

pub fn update_project_node_methods(conn: Conn, object_id: &ObjectId, methods: Vec<String>) -> Result<(), String> {
    let value = to_json_string(&methods).unwrap();
    update_project_node(conn, object_id, schema::methods.eq(value))
}

fn update_project_node<V>(mut conn: Conn, object_id: &ObjectId, value: V) -> Result<(), String>
where
    V: AsChangeset<Target = schema::table> + 'static,
    <V as AsChangeset>::Changeset: QueryFragment<Mysql> + 'static,
{
    let count = update(schema::table.find(object_id)).set(value).execute(&mut conn).map_err(|e| e.to_string())?;

    match count {
        1 => Ok(()),
        _ => Err(format!("unexpected update: [ {} rows found ]", count)),
    }
}

pub fn delete_project_node(mut conn: Conn, object_id: &ObjectId) -> Result<(), String> {
    delete(schema::table.find(object_id)).execute(&mut conn).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use diesel::sql_types::Text;
    use diesel::{sql_query, RunQueryDsl};
    use itertools::Itertools;
    use uuid::Uuid;

    use crate::db::create_connection_pool;
    use crate::db::store::project::project_node_store::{
        create_project_node, delete_project_node, find_project_nodes, update_project_node_icon_id,
        update_project_node_methods, update_project_node_name, update_project_node_properties,
    };
    use crate::db::store::project::project_store::create_project;

    #[test]
    fn test() {
        // init
        let pool = create_connection_pool().unwrap();

        // setup keys
        let object_id = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup parent table
        create_project(pool.get().unwrap(), project_id.clone(), String::from("project 1")).unwrap();

        // find
        let rows = find_project_nodes(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(0, rows.len());

        // create
        create_project_node(
            pool.get().unwrap(),
            object_id.clone(),
            project_id.clone(),
            String::from("name1"),
            String::from("icon1"),
        )
        .unwrap();

        // find
        let rows = find_project_nodes(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(1, rows.len());
        assert_eq!("name1", &rows[0].data.name);
        assert_eq!("icon1", &rows[0].data.icon_id);

        // update name
        update_project_node_name(pool.get().unwrap(), &object_id, String::from("name2")).unwrap();

        // find
        let rows = find_project_nodes(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!("name2", &rows[0].data.name);

        // update name
        update_project_node_icon_id(pool.get().unwrap(), &object_id, String::from("icon2")).unwrap();

        // find
        let rows = find_project_nodes(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!("icon2", &rows[0].data.icon_id);

        // update properties
        update_project_node_properties(
            pool.get().unwrap(),
            &object_id,
            vec![String::from("property 1"), String::from("property 2")],
        )
        .unwrap();

        // find
        let rows = find_project_nodes(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(vec!["property 1", "property 2"], rows[0].data.properties.iter().collect_vec());

        // update methods
        update_project_node_methods(
            pool.get().unwrap(),
            &object_id,
            vec![String::from("method 1"), String::from("method 2")],
        )
        .unwrap();

        // find
        let rows = find_project_nodes(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(vec!["method 1", "method 2"], rows[0].data.methods.iter().collect_vec());

        // update methods
        update_project_node_methods(pool.get().unwrap(), &object_id, vec![]).unwrap();

        // find
        let rows = find_project_nodes(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(0, rows[0].data.methods.len());

        // delete
        delete_project_node(pool.get().unwrap(), &object_id).unwrap();

        // find
        let rows = find_project_nodes(pool.get().unwrap(), &project_id).unwrap();
        assert_eq!(0, rows.len());

        // clean up
        sql_query("delete from project where project_id = ?")
            .bind::<Text, _>(&project_id)
            .execute(&mut pool.get().unwrap())
            .unwrap();
    }
}
