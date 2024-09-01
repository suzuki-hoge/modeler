use actix_web::web::{Data, Json, Path};
use actix_web::{HttpRequest, HttpResponse};
use serde::Deserialize;
use serde_json::json;

use crate::controller::auth::auth;
use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::db::store::user::{user_project_page_store, user_store};
use crate::db::Pool;

pub async fn get_project_pages(request: HttpRequest, pool: Data<Pool>) -> HttpResponse {
    auth(
        request,
        |user_id| user_store::exists(&mut pool.get().unwrap(), user_id),
        |user_id| user_project_page_store::find_user_project_pages(&mut pool.get().unwrap(), user_id),
    )
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectPage {
    project_id: ProjectId,
    project_name: String,
    page_id: PageId,
    page_name: String,
}

pub async fn create_project_page(
    request: HttpRequest,
    pool: Data<Pool>,
    create_project: Json<CreateProjectPage>,
) -> HttpResponse {
    auth(
        request,
        |user_id| user_store::exists(&mut pool.get().unwrap(), user_id),
        |user_id| {
            user_project_page_store::create_user_project_page(
                &mut pool.get().unwrap(),
                user_id,
                &create_project.project_id,
                &create_project.project_name,
                &create_project.page_id,
                &create_project.page_name,
            )
        },
    )
}

pub async fn is_joined(request: HttpRequest, pool: Data<Pool>, path: Path<ProjectId>) -> HttpResponse {
    let project_id = path.into_inner();

    auth(
        request,
        |user_id| user_project_page_store::is_user_in_project(&mut pool.get().unwrap(), user_id, &project_id),
        |_| Ok(json! {{"joined": true}}),
    )
}
