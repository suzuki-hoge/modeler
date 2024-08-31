use diesel::dsl::count;
use diesel::insert_into;
use diesel::prelude::*;

use crate::data::user::{UserConfig, UserId};
use crate::db::schema::{user, user_config};
use crate::db::store::user::model::{UserConfigRow, UserRow};
use crate::db::Conn;

pub fn exists(conn: &mut Conn, user_id: &UserId) -> Result<bool, String> {
    let count = user::table
        .filter(user::user_id.eq(user_id))
        .select(count(user::user_id))
        .first::<i64>(conn)
        .map_err(|e| e.to_string())?;

    Ok(count == 1)
}

pub fn sign_up(conn: &mut Conn, user_id: &UserId) -> Result<bool, String> {
    if exists(conn, user_id)? {
        Ok(false)
    } else {
        let user_row = UserRow::new(user_id);
        insert_into(user::table).values(&user_row).execute(conn).map_err(|e| e.to_string())?;

        let user_config_row = UserConfigRow::new(user_id);
        insert_into(user_config::table).values(&user_config_row).execute(conn).map_err(|e| e.to_string())?;

        Ok(true)
    }
}

pub fn find_user_config(conn: &mut Conn, user_id: &UserId) -> Result<UserConfig, String> {
    user_config::table.find(user_id).first::<UserConfigRow>(conn).map(UserConfig::from).map_err(|e| e.to_string())
}

pub fn update_user_config(
    conn: &mut Conn,
    user_id: &UserId,
    reflect_page_object_on_text_input: bool,
    show_base_type_attributes: bool,
    show_in_second_language: bool,
) -> Result<(), String> {
    diesel::update(user_config::table.find(user_id))
        .set((
            user_config::reflect_page_object_on_text_input.eq(reflect_page_object_on_text_input),
            user_config::show_base_type_attributes.eq(show_base_type_attributes),
            user_config::show_in_second_language.eq(show_in_second_language),
        ))
        .execute(conn)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use uuid::Uuid;

    use crate::db::create_connection_pool;
    use crate::db::store::user::user_store;

    #[test]
    fn test() -> Result<(), String> {
        // init
        let mut conn = create_connection_pool().unwrap().get().unwrap();

        // setup keys
        let user_id = Uuid::new_v4().to_string();

        // insert ( processed 9
        let processed = user_store::sign_up(&mut conn, &user_id)?;
        assert!(processed);

        // find
        let row = user_store::find_user_config(&mut conn, &user_id)?;
        assert!(!row.reflect_page_object_on_text_input);
        assert!(!row.show_base_type_attributes);
        assert!(!row.show_in_second_language);

        // insert ( skip )
        let processed = user_store::sign_up(&mut conn, &user_id)?;
        assert!(!processed);

        // update
        user_store::update_user_config(&mut conn, &user_id, true, true, true)?;

        // find
        let row = user_store::find_user_config(&mut conn, &user_id)?;
        assert!(row.reflect_page_object_on_text_input);
        assert!(row.show_base_type_attributes);
        assert!(row.show_in_second_language);

        // update
        user_store::update_user_config(&mut conn, &user_id, false, false, false)?;

        // find
        let row = user_store::find_user_config(&mut conn, &user_id)?;
        assert!(!row.reflect_page_object_on_text_input);
        assert!(!row.show_base_type_attributes);
        assert!(!row.show_in_second_language);

        Ok(())
    }
}
