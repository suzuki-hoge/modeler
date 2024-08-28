use diesel::prelude::*;
use diesel::update;

use crate::data::user::{UserConfig, UserId};
use crate::db::schema::user_config as schema;
use crate::db::Conn;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = schema)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
struct Row {
    user_id: UserId,
    reflect_page_object_on_text_input: bool,
    show_base_type_attributes: bool,
    show_in_second_language: bool,
}

fn read(row: Row) -> UserConfig {
    UserConfig {
        id: row.user_id,
        reflect_page_object_on_text_input: row.reflect_page_object_on_text_input,
        show_base_type_attributes: row.show_base_type_attributes,
        show_in_second_language: row.show_in_second_language,
    }
}

pub fn find(conn: &mut Conn, user_id: &UserId) -> Result<UserConfig, String> {
    schema::table.find(user_id).first(conn).map(read).map_err(|e| e.to_string())
}

pub fn update_user_config(
    conn: &mut Conn,
    user_id: &UserId,
    reflect_page_object_on_text_input: bool,
    show_base_type_attributes: bool,
    show_in_second_language: bool,
) -> Result<(), String> {
    update(schema::table.find(user_id))
        .set((
            schema::reflect_page_object_on_text_input.eq(reflect_page_object_on_text_input),
            schema::show_base_type_attributes.eq(show_base_type_attributes),
            schema::show_in_second_language.eq(show_in_second_language),
        ))
        .execute(conn)
        .map_err(|e| e.to_string())?;

    Ok(())
}

// #[cfg(test)]
// mod tests {
//     use crate::db::create_connection_pool;
//     use crate::db::store::user::user_config_store::{find, update_user_config};
//     use crate::db::store::DatabaseError;
//
//     #[test]
//     fn test() -> Result<(), DatabaseError> {
//         // init
//         let mut conn = create_connection_pool().unwrap().get().unwrap();
//
//         // setup keys
//         let user_id = String::from("e1af5cbd-e2aa-44cb-91df-92884541a5a5");
//
//         // find
//         let row = find(&mut conn, &user_id)?;
//         assert!(!row.reflect_page_object_on_text_input);
//         assert!(!row.show_base_type_attributes);
//         assert!(!row.show_in_second_language);
//
//         // update
//         update_user_config(&mut conn, &user_id, true, true, true)?;
//
//         // find
//         let row = find(&mut conn, &user_id)?;
//         assert!(row.reflect_page_object_on_text_input);
//         assert!(row.show_base_type_attributes);
//         assert!(row.show_in_second_language);
//
//         // update
//         update_user_config(&mut conn, &user_id, false, false, false)?;
//
//         // find
//         let row = find(&mut conn, &user_id)?;
//         assert!(!row.reflect_page_object_on_text_input);
//         assert!(!row.show_base_type_attributes);
//         assert!(!row.show_in_second_language);
//
//         Ok(())
//     }
// }
