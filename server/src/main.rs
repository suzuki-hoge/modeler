use actix_cors::Cors;
use actix_web::http::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE};
use actix_web::{
    web,
    web::{resource, Data},
    App, HttpServer,
};

use crate::actor::{start_server, start_session};
use crate::controller::{page_controller, project_controller};

mod actor;
mod controller;
mod data;
mod db;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let server = start_server();

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![AUTHORIZATION, ACCEPT])
            .allowed_header(CONTENT_TYPE)
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(Data::new(server.clone()))
            .service(resource("/ws/{project_id}/{page_id}/{user}").to(start_session))
            .route("/projects", web::get().to(project_controller::get_projects))
            .route("/project/{project_id}/pages", web::get().to(project_controller::get_pages))
            .route("/project/{project_id}/nodes", web::get().to(project_controller::get_nodes))
            .route("/project/{project_id}/{page_id}/nodes", web::get().to(page_controller::get_nodes))
            .route("/{project_id}/icons", web::get().to(project_controller::get_icons))
            .route("/{project_id}/edges", web::get().to(project_controller::get_edges))
            .route("/{project_id}/{page_id}/edges", web::get().to(page_controller::get_edges))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
