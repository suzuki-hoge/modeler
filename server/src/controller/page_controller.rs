use actix_web::web::{Data, Path};
use actix_web::{HttpRequest, HttpResponse};

use crate::controller::auth::auth;
use crate::data::page::PageId;
use crate::db::store::page::{page_edge_store, page_node_store, page_store};
use crate::db::store::user::user_project_store;
use crate::db::Pool;

pub async fn get_page(request: HttpRequest, pool: Data<Pool>, path: Path<PageId>) -> HttpResponse {
    let page_id = path.into_inner();

    auth(
        request,
        format!("/page/{page_id}"),
        |user_id| user_project_store::is_user_in_page(&mut pool.get().unwrap(), user_id, &page_id),
        || page_store::find_one(&mut pool.get().unwrap(), &page_id),
    )
}

pub async fn get_nodes(request: HttpRequest, pool: Data<Pool>, path: Path<PageId>) -> HttpResponse {
    let page_id = path.into_inner();

    auth(
        request,
        format!("/page/{page_id}/nodes"),
        |user_id| user_project_store::is_user_in_page(&mut pool.get().unwrap(), user_id, &page_id),
        || page_node_store::find(&mut pool.get().unwrap(), &page_id),
    )
}

pub async fn get_edges(request: HttpRequest, pool: Data<Pool>, path: Path<PageId>) -> HttpResponse {
    let page_id = path.into_inner();

    auth(
        request,
        format!("/page/{page_id}/edges"),
        |user_id| user_project_store::is_user_in_page(&mut pool.get().unwrap(), user_id, &page_id),
        || page_edge_store::find(&mut pool.get().unwrap(), &page_id),
    )
}
