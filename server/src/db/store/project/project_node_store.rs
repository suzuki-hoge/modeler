use diesel::insert_into;
use diesel::mysql::Mysql;
use diesel::prelude::*;
use diesel::query_builder::QueryFragment;
use serde_json::to_string as to_json_string;

use crate::data::node::ProjectNode;
use crate::data::project::ProjectId;
use crate::data::ObjectId;
use crate::db::schema::project_node;
use crate::db::store::project::model::ProjectNodeRow;
use crate::db::Conn;

pub fn find(conn: &mut Conn, project_id: &ProjectId) -> Result<Vec<ProjectNode>, String> {
    project_node::table
        .filter(project_node::project_id.eq(project_id))
        .load::<ProjectNodeRow>(conn)
        .map(|row| row.into_iter().map(ProjectNode::from).collect())
        .map_err(|e| e.to_string())
}

pub fn insert(
    conn: &mut Conn,
    object_id: &ObjectId,
    project_id: &ProjectId,
    object_type: &str,
    name: &str,
    icon_id: &str,
) -> Result<(), String> {
    let row = ProjectNodeRow::new(object_id, project_id, object_type, name, icon_id);
    insert_into(project_node::table).values(&row).execute(conn).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn update_name(conn: &mut Conn, object_id: &ObjectId, name: &str) -> Result<(), String> {
    update(conn, object_id, project_node::name.eq(name.to_string()))
}

pub fn update_icon_id(conn: &mut Conn, object_id: &ObjectId, icon_id: &str) -> Result<(), String> {
    update(conn, object_id, project_node::icon_id.eq(icon_id.to_string()))
}

pub fn update_properties(conn: &mut Conn, object_id: &ObjectId, properties: &[String]) -> Result<(), String> {
    let value = to_json_string(&properties).unwrap();
    update(conn, object_id, project_node::properties.eq(value))
}

pub fn update_methods(conn: &mut Conn, object_id: &ObjectId, methods: &[String]) -> Result<(), String> {
    let value = to_json_string(&methods).unwrap();
    update(conn, object_id, project_node::methods.eq(value))
}

fn update<V>(conn: &mut Conn, object_id: &ObjectId, value: V) -> Result<(), String>
where
    V: AsChangeset<Target = project_node::table> + 'static,
    <V as AsChangeset>::Changeset: QueryFragment<Mysql> + 'static,
{
    diesel::update(project_node::table.find(object_id)).set(value).execute(conn).map_err(|e| e.to_string())?;

    Ok(())
}

pub fn delete(conn: &mut Conn, object_id: &ObjectId) -> Result<(), String> {
    diesel::delete(project_node::table.find(object_id)).execute(conn).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use itertools::Itertools;
    use uuid::Uuid;

    use crate::db::create_connection_pool;
    use crate::db::store::project::{project_node_store, project_store};

    fn s(value: &'static str) -> String {
        String::from(value)
    }

    #[test]
    fn test() -> Result<(), String> {
        // init
        let mut conn = create_connection_pool().unwrap().get().unwrap();

        // setup keys
        let object_id = Uuid::new_v4().to_string();
        let project_id = Uuid::new_v4().to_string();

        // setup parent table
        project_store::create(&mut conn, &project_id, &s("project 1"))?;

        // find
        let rows = project_node_store::find(&mut conn, &project_id)?;
        assert_eq!(0, rows.len());

        // insert
        project_node_store::insert(&mut conn, &object_id, &project_id, &s("class"), &s("name1"), &s("icon1"))?;

        // find
        let rows = project_node_store::find(&mut conn, &project_id)?;
        assert_eq!(1, rows.len());
        assert_eq!("name1", &rows[0].data.name);
        assert_eq!("icon1", &rows[0].data.icon_id);

        // update name
        project_node_store::update_name(&mut conn, &object_id, &s("name2"))?;

        // find
        let rows = project_node_store::find(&mut conn, &project_id)?;
        assert_eq!("name2", &rows[0].data.name);

        // update name
        project_node_store::update_icon_id(&mut conn, &object_id, &s("icon2"))?;

        // find
        let rows = project_node_store::find(&mut conn, &project_id)?;
        assert_eq!("icon2", &rows[0].data.icon_id);

        // update properties
        project_node_store::update_properties(&mut conn, &object_id, &[s("property 1"), s("property 2")])?;

        // find
        let rows = project_node_store::find(&mut conn, &project_id)?;
        assert_eq!(vec!["property 1", "property 2"], rows[0].data.properties.iter().collect_vec());

        // update methods
        project_node_store::update_methods(&mut conn, &object_id, &[s("method 1"), s("method 2")])?;

        // find
        let rows = project_node_store::find(&mut conn, &project_id)?;
        assert_eq!(vec!["method 1", "method 2"], rows[0].data.methods.iter().collect_vec());

        // update methods
        project_node_store::update_methods(&mut conn, &object_id, &[])?;

        // find
        let rows = project_node_store::find(&mut conn, &project_id)?;
        assert_eq!(0, rows[0].data.methods.len());

        // delete
        project_node_store::delete(&mut conn, &object_id)?;

        // find
        let rows = project_node_store::find(&mut conn, &project_id)?;
        assert_eq!(0, rows.len());

        Ok(())
    }
}
