use actix_cors::Cors;
use actix_web::http::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE};
use actix_web::{
    web,
    web::{resource, Data},
    App, HttpServer,
};
use web::{get, post};

use crate::actor::{start_server, start_session};
use crate::controller::log::log_middleware;
use crate::controller::{
    page_controller, page_object_controller, project_controller, project_object_controller, user_controller,
    user_project_controller, user_project_page_controller,
};
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
            .wrap_fn(log_middleware)
            // socket
            .service(resource("/ws/{project_id}/{page_id}/{user_id}").to(start_session))
            // user controller
            .route("/user/sign_up", post().to(user_controller::sign_up))
            .route("/user/config", get().to(user_controller::get_user_config))
            // project page controller
            .route("/user-project-pages", get().to(user_project_page_controller::get_project_pages))
            .route("/user-project-page/create", post().to(user_project_page_controller::create_project_page))
            .route("/user-project-page/{project_id}/joined", get().to(user_project_page_controller::is_joined))
            // user project controller
            .route("/user-project/{project_id}/join", post().to(user_project_controller::join))
            // project controller
            .route("/project/{project_id}/icons", get().to(project_controller::get_icons))
            // project object controller
            .route("/project/{project_id}/nodes", get().to(project_object_controller::get_nodes))
            .route("/project/{project_id}/edges", get().to(project_object_controller::get_edges))
            // page controller
            .route("/page/{page_id}/name", get().to(page_controller::get_name))
            // page object controller
            .route("/page/{page_id}/nodes", get().to(page_object_controller::get_nodes))
            .route("/page/{page_id}/edges", get().to(page_object_controller::get_edges))
    })
    .bind(("127.0.0.1", 8080))
    .map_err(|e| e.to_string())?
    .run()
    .await
    .map_err(|e| e.to_string())
}
