use diesel::{Insertable, Queryable, Selectable};

use crate::data::project::ProjectId;
use crate::data::user::{UserConfig, UserId, UserProjectPage};
use crate::db::schema::{user, user_config, user_project};
use crate::db::store::page::model::PageRow;
use crate::db::store::project::model::ProjectRow;

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = user)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct UserRow {
    user_id: UserId,
}

impl UserRow {
    pub fn new(user_id: &UserId) -> Self {
        Self { user_id: user_id.clone() }
    }
}

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = user_config)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct UserConfigRow {
    user_id: UserId,
    reflect_page_object_on_text_input: bool,
    show_base_type_attributes: bool,
    show_in_second_language: bool,
}

impl UserConfigRow {
    pub fn new(user_id: &UserId) -> Self {
        Self {
            user_id: user_id.clone(),
            reflect_page_object_on_text_input: false,
            show_base_type_attributes: false,
            show_in_second_language: false,
        }
    }
}

impl From<UserConfigRow> for UserConfig {
    fn from(row: UserConfigRow) -> Self {
        Self {
            id: row.user_id,
            reflect_page_object_on_text_input: row.reflect_page_object_on_text_input,
            show_base_type_attributes: row.show_base_type_attributes,
            show_in_second_language: row.show_in_second_language,
        }
    }
}

#[derive(Queryable, Selectable, Insertable, Debug)]
#[diesel(table_name = user_project)]
#[diesel(check_for_backend(diesel::mysql::Mysql))]
pub struct UserProjectRow {
    user_id: UserId,
    project_id: ProjectId,
}

impl UserProjectRow {
    pub fn new(user_id: &UserId, project_id: &ProjectId) -> Self {
        Self { user_id: user_id.clone(), project_id: project_id.clone() }
    }
}

impl From<(ProjectRow, PageRow)> for UserProjectPage {
    fn from(row: (ProjectRow, PageRow)) -> Self {
        Self { project_id: row.0.project_id, project_name: row.0.name, page_id: row.1.page_id, page_name: row.1.name }
    }
}
