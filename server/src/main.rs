use crate::actor::{start_server, start_session};
use crate::controller::node::node_controller::{get_node, get_node_headers};
use actix_cors::Cors;
use actix_web::http::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE};
use actix_web::{
    web,
    web::{resource, Data},
    App, HttpServer,
};

mod actor;
mod controller;
mod data;

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
            .service(resource("/ws/{page_id}/{user}").to(start_session))
            .route("/node/headers/{project_id}/{sleep}", web::get().to(get_node_headers))
            .route("/node/{project_id}/{object_id}/{sleep}", web::get().to(get_node))
    })
    .workers(2)
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
