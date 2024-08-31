use actix_web::web::{Data, Path};
use actix_web::{HttpRequest, HttpResponse};

use crate::controller::auth::auth;
use crate::data::page::PageId;
use crate::db::store::page::page_store;
use crate::db::store::user::user_project_page_store;
use crate::db::Pool;

pub async fn get_name(request: HttpRequest, pool: Data<Pool>, path: Path<PageId>) -> HttpResponse {
    let page_id = path.into_inner();

    auth(
        request,
        format!("/page/{page_id}"),
        |user_id| user_project_page_store::is_user_in_page(&mut pool.get().unwrap(), user_id, &page_id),
        |_| page_store::find_name(&mut pool.get().unwrap(), &page_id),
    )
}
