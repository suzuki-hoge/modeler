use crate::actor::{start_server, start_session};
use actix_web::{
    web::{resource, Data},
    App, HttpServer,
};

mod actor;
mod data;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let server = start_server();

    HttpServer::new(move || {
        App::new().app_data(Data::new(server.clone())).service(resource("/ws/{page_id}/{user}").to(start_session))
    })
    .workers(2)
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
