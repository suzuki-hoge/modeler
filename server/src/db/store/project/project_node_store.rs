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
use crate::db::store::project::project_store;
use crate::db::store::DatabaseError;
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

pub fn find_project_nodes(conn: &mut Conn, project_id: &ProjectId) -> Result<Vec<ProjectNode>, DatabaseError> {
    project_store::exists(conn, project_id)?;

    let rows = schema::table
        .filter(schema::project_id.eq(project_id))
        .select(Row::as_select())
        .load(conn)
        .map_err(DatabaseError::other)?;

    Ok(rows.into_iter().map(read).collect_vec())
}

pub fn create_project_node(
    conn: &mut Conn,
    object_id: &ObjectId,
    project_id: &ProjectId,
    name: &String,
    icon_id: &String,
) -> Result<(), DatabaseError> {
    let empty: Vec<String> = vec![];
    let row = Row {
        object_id: object_id.clone(),
        project_id: project_id.clone(),
        name: name.clone(),
        icon_id: icon_id.clone(),
        properties: to_json_string(&empty).unwrap(),
        methods: to_json_string(&empty).unwrap(),
    };

    insert_into(schema::table).values(&row).execute(conn).map_err(DatabaseError::other)?;

    Ok(())
}

pub fn update_project_node_name(conn: &mut Conn, object_id: &ObjectId, name: &String) -> Result<(), DatabaseError> {
    update_project_node(conn, object_id, schema::name.eq(name.clone()))
}

pub fn update_project_node_icon_id(
    conn: &mut Conn,
    object_id: &ObjectId,
    icon_id: &String,
) -> Result<(), DatabaseError> {
    update_project_node(conn, object_id, schema::icon_id.eq(icon_id.clone()))
}

pub fn update_project_node_properties(
    conn: &mut Conn,
    object_id: &ObjectId,
    properties: Vec<&String>,
) -> Result<(), DatabaseError> {
    let value = to_json_string(&properties).unwrap();
    update_project_node(conn, object_id, schema::properties.eq(value))
}

pub fn update_project_node_methods(
    conn: &mut Conn,
    object_id: &ObjectId,
    methods: Vec<&String>,
) -> Result<(), DatabaseError> {
    let value = to_json_string(&methods).unwrap();
    update_project_node(conn, object_id, schema::methods.eq(value))
}

fn update_project_node<V>(conn: &mut Conn, object_id: &ObjectId, value: V) -> Result<(), DatabaseError>
where
    V: AsChangeset<Target = schema::table> + 'static,
    <V as AsChangeset>::Changeset: QueryFragment<Mysql> + 'static,
{
    let count = update(schema::table.find(object_id)).set(value).execute(conn).map_err(DatabaseError::other)?;

    match count {
        1 => Ok(()),
        _ => Err(DatabaseError::unexpected_row_matched(count)),
    }
}

pub fn delete_project_node(conn: &mut Conn, object_id: &ObjectId) -> Result<(), DatabaseError> {
    delete(schema::table.find(object_id)).execute(conn).map_err(DatabaseError::other)?;

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
    use crate::db::store::DatabaseError;

    fn s(value: &'static str) -> String {
        String::from(value)
    }

    #[test]
    fn test() -> Result<(), DatabaseError> {
        // init
        let mut conn = create_connection_pool().unwrap().get().unwrap();

        // setup keys
        let object_id = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup parent table
        create_project(&mut conn, &project_id, &s("project 1"))?;

        // find
        let rows = find_project_nodes(&mut conn, &project_id)?;
        assert_eq!(0, rows.len());

        // create
        create_project_node(&mut conn, &object_id, &project_id, &s("name1"), &s("icon1"))?;

        // find
        let rows = find_project_nodes(&mut conn, &project_id)?;
        assert_eq!(1, rows.len());
        assert_eq!("name1", &rows[0].data.name);
        assert_eq!("icon1", &rows[0].data.icon_id);

        // update name
        update_project_node_name(&mut conn, &object_id, &s("name2"))?;

        // find
        let rows = find_project_nodes(&mut conn, &project_id)?;
        assert_eq!("name2", &rows[0].data.name);

        // update name
        update_project_node_icon_id(&mut conn, &object_id, &s("icon2"))?;

        // find
        let rows = find_project_nodes(&mut conn, &project_id)?;
        assert_eq!("icon2", &rows[0].data.icon_id);

        // update properties
        update_project_node_properties(&mut conn, &object_id, vec![&s("property 1"), &s("property 2")])?;

        // find
        let rows = find_project_nodes(&mut conn, &project_id)?;
        assert_eq!(vec!["property 1", "property 2"], rows[0].data.properties.iter().collect_vec());

        // update methods
        update_project_node_methods(&mut conn, &object_id, vec![&s("method 1"), &s("method 2")])?;

        // find
        let rows = find_project_nodes(&mut conn, &project_id)?;
        assert_eq!(vec!["method 1", "method 2"], rows[0].data.methods.iter().collect_vec());

        // update methods
        update_project_node_methods(&mut conn, &object_id, vec![])?;

        // find
        let rows = find_project_nodes(&mut conn, &project_id)?;
        assert_eq!(0, rows[0].data.methods.len());

        // delete
        delete_project_node(&mut conn, &object_id)?;

        // find
        let rows = find_project_nodes(&mut conn, &project_id)?;
        assert_eq!(0, rows.len());

        // clean up
        sql_query("delete from project where project_id = ?").bind::<Text, _>(&project_id).execute(&mut conn).unwrap();

        Ok(())
    }
}
