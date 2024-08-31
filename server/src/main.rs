use actix_cors::Cors;
use actix_web::http::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE};
use actix_web::{
    web,
    web::{resource, Data},
    App, HttpServer,
};

use crate::actor::{start_server, start_session};
use crate::controller::{debug_controller, page_controller, project_controller, user_controller};
use crate::db::create_connection_pool;

mod actor;
mod controller;
mod data;
mod db;
mod logger;

#[actix_web::main]
async fn main() -> Result<(), String> {
    let pool = create_connection_pool()?;

    let server = start_server(pool.clone());

    logger::init();

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![AUTHORIZATION, ACCEPT])
            .allowed_header(CONTENT_TYPE)
            .allowed_header("Modeler-User-Id")
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(Data::new(server.clone()))
            .app_data(Data::new(pool.clone()))
            .service(resource("/ws/{project_id}/{page_id}/{user_id}").to(start_session))
            .route("/user/sign_up", web::post().to(user_controller::sign_up))
            .route("/user/joined/{project_id}", web::get().to(user_controller::joined))
            .route("/user/pages", web::get().to(user_controller::get_pages))
            .route("/user/config", web::get().to(user_controller::get_user_config))
            .route("/project/create", web::post().to(project_controller::create))
            .route("/project/{project_id}/pages", web::get().to(project_controller::get_pages))
            .route("/project/{project_id}/icons", web::get().to(project_controller::get_icons))
            .route("/project/{project_id}/nodes", web::get().to(project_controller::get_nodes))
            .route("/project/{project_id}/edges", web::get().to(project_controller::get_edges))
            .route("/page/{page_id}", web::get().to(page_controller::get_page))
            .route("/page/{page_id}/nodes", web::get().to(page_controller::get_nodes))
            .route("/page/{page_id}/edges", web::get().to(page_controller::get_edges))
            .route("/debug/session", web::get().to(debug_controller::session))
    })
    .bind(("127.0.0.1", 8080))
    .map_err(|e| e.to_string())?
    .run()
    .await
    .map_err(|e| e.to_string())
}
