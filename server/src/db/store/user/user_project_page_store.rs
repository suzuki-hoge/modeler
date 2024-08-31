use diesel::prelude::*;

use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::data::user::{UserId, UserProjectPage};
use crate::db::schema::{page, project, user_project};
use crate::db::store::page::model::PageRow;
use crate::db::store::page::page_store;
use crate::db::store::project::model::ProjectRow;
use crate::db::store::project::project_store;
use crate::db::store::user::user_project_store;
use crate::db::Conn;

pub fn find_user_project_pages(conn: &mut Conn, user_id: &UserId) -> Result<Vec<UserProjectPage>, String> {
    user_project::table
        .filter(user_project::user_id.eq(user_id))
        .inner_join(page::table.on(user_project::project_id.eq(page::project_id)))
        .inner_join(project::table.on(page::project_id.eq(project::project_id)))
        .select((ProjectRow::as_select(), PageRow::as_select()))
        .load::<(ProjectRow, PageRow)>(conn)
        .map(|row| row.into_iter().map(UserProjectPage::from).collect())
        .map_err(|e| e.to_string())
}

pub fn create_user_project_page(
    conn: &mut Conn,
    user_id: &UserId,
    project_id: &ProjectId,
    project_name: &str,
    page_id: &PageId,
    page_name: &str,
) -> Result<(), String> {
    project_store::create(conn, project_id, project_name)?;
    page_store::create(conn, page_id, project_id, page_name)?;
    user_project_store::create(conn, user_id, project_id)?;

    Ok(())
}

pub fn is_user_in_project(conn: &mut Conn, user_id: &UserId, project_id: &ProjectId) -> Result<bool, String> {
    user_project::table
        .filter(user_project::user_id.eq(user_id))
        .select(user_project::project_id)
        .load::<ProjectId>(conn)
        .map(|rows| rows.contains(project_id))
        .map_err(|e| e.to_string())
}

pub fn is_user_in_page(conn: &mut Conn, user_id: &UserId, page_id: &PageId) -> Result<bool, String> {
    user_project::table
        .inner_join(page::table.on(page::project_id.eq(user_project::project_id)))
        .filter(user_project::user_id.eq(user_id))
        .select(page::page_id)
        .load::<PageId>(conn)
        .map(|rows| rows.contains(page_id))
        .map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use itertools::Itertools;
    use uuid::Uuid;

    use crate::db::create_connection_pool;
    use crate::db::store::page::page_store;
    use crate::db::store::project::project_store;
    use crate::db::store::user::{user_project_page_store, user_project_store, user_store};

    fn s(value: &'static str) -> String {
        String::from(value)
    }

    #[test]
    fn test() -> Result<(), String> {
        // init
        let mut conn = create_connection_pool().unwrap().get().unwrap();

        // setup keys
        let user_id = Uuid::new_v4().to_string();
        let project_id1 = Uuid::new_v4().to_string();
        let project_id2 = Uuid::new_v4().to_string();
        let project_id3 = Uuid::new_v4().to_string();
        let page_id1 = Uuid::new_v4().to_string();
        let page_id2 = Uuid::new_v4().to_string();
        let page_id3 = Uuid::new_v4().to_string();
        let page_id4 = Uuid::new_v4().to_string();

        // setup tables
        user_store::sign_up(&mut conn, &user_id)?;
        project_store::create(&mut conn, &project_id1, &s("project 1"))?;
        project_store::create(&mut conn, &project_id2, &s("project 2"))?;
        project_store::create(&mut conn, &project_id3, &s("project 3"))?;
        page_store::create(&mut conn, &page_id1, &project_id1, &s("page 1 in project 1"))?;
        page_store::create(&mut conn, &page_id2, &project_id2, &s("page 2 in project 2"))?;
        page_store::create(&mut conn, &page_id3, &project_id3, &s("page 3 in project 3"))?;
        page_store::create(&mut conn, &page_id4, &project_id3, &s("page 4 in project 3"))?;

        // find
        let rows = user_project_page_store::find_user_project_pages(&mut conn, &user_id)?;
        assert_eq!(0, rows.len());

        // check in project
        let is_in1 = user_project_page_store::is_user_in_project(&mut conn, &user_id, &project_id1)?;
        assert!(!is_in1);
        let is_in2 = user_project_page_store::is_user_in_project(&mut conn, &user_id, &project_id2)?;
        assert!(!is_in2);
        let is_in3 = user_project_page_store::is_user_in_project(&mut conn, &user_id, &project_id3)?;
        assert!(!is_in3);

        // check in page
        let is_in1 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id1)?;
        assert!(!is_in1);
        let is_in2 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id2)?;
        assert!(!is_in2);
        let is_in3 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id3)?;
        assert!(!is_in3);
        let is_in4 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id4)?;
        assert!(!is_in4);

        // insert
        user_project_store::create(&mut conn, &user_id, &project_id1)?;

        // find
        let rows = user_project_page_store::find_user_project_pages(&mut conn, &user_id)?;
        assert_eq!(1, rows.len());
        assert_eq!(&page_id1, &rows[0].page_id);

        // check in project
        let is_in1 = user_project_page_store::is_user_in_project(&mut conn, &user_id, &project_id1)?;
        assert!(is_in1);
        let is_in2 = user_project_page_store::is_user_in_project(&mut conn, &user_id, &project_id2)?;
        assert!(!is_in2);
        let is_in3 = user_project_page_store::is_user_in_project(&mut conn, &user_id, &project_id3)?;
        assert!(!is_in3);

        // check in page
        let is_in1 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id1)?;
        assert!(is_in1);
        let is_in2 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id2)?;
        assert!(!is_in2);
        let is_in3 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id3)?;
        assert!(!is_in3);
        let is_in4 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id4)?;
        assert!(!is_in4);

        // insert
        user_project_store::create(&mut conn, &user_id, &project_id3)?;

        // find
        let rows = user_project_page_store::find_user_project_pages(&mut conn, &user_id)?;
        let rows = rows.iter().sorted_by_key(|row| &row.page_name).collect_vec();
        assert_eq!(3, rows.len());
        assert_eq!(&page_id1, &rows[0].page_id);
        assert_eq!(&page_id3, &rows[1].page_id);
        assert_eq!(&page_id4, &rows[2].page_id);

        // check in project
        let is_in1 = user_project_page_store::is_user_in_project(&mut conn, &user_id, &project_id1)?;
        assert!(is_in1);
        let is_in2 = user_project_page_store::is_user_in_project(&mut conn, &user_id, &project_id2)?;
        assert!(!is_in2);
        let is_in3 = user_project_page_store::is_user_in_project(&mut conn, &user_id, &project_id3)?;
        assert!(is_in3);

        // check in page
        let is_in1 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id1)?;
        assert!(is_in1);
        let is_in2 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id2)?;
        assert!(!is_in2);
        let is_in3 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id3)?;
        assert!(is_in3);
        let is_in4 = user_project_page_store::is_user_in_page(&mut conn, &user_id, &page_id4)?;
        assert!(is_in4);

        Ok(())
    }
}
