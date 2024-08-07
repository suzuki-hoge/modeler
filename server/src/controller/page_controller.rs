use actix_web::web::{Data, Path};
use actix_web::HttpResponse;

use crate::controller::respond;
use crate::data::page::PageId;
use crate::db::store::page::{page_edge_store, page_node_store};
use crate::db::Pool;

pub async fn get_nodes(pool: Data<Pool>, path: Path<PageId>) -> HttpResponse {
    let page_id = path.into_inner();

    println!("/page/{page_id}/nodes");

    respond(page_node_store::find_page_nodes(&mut pool.get().unwrap(), &page_id))
}

pub async fn get_edges(pool: Data<Pool>, path: Path<PageId>) -> HttpResponse {
    let page_id = path.into_inner();

    println!("/page/{page_id}/edges");

    respond(page_edge_store::find_page_edges(&mut pool.get().unwrap(), &page_id))
}
