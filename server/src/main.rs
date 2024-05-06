use actix::{Actor, Addr};
use std::time::Instant;

use crate::server::ChatServer;
use crate::session::WsChatSession;
use actix_web::{
    web::{resource, Data, Payload},
    App, Error, HttpRequest, HttpResponse, HttpServer,
};
use actix_web_actors::ws::start;

mod server;
mod session;

async fn chat_route(
    request: HttpRequest,
    payload: Payload,
    server_address: Data<Addr<ChatServer>>,
) -> Result<HttpResponse, Error> {
    start(
        WsChatSession {
            id: 0,
            last_heartbeat: Instant::now(),
            page_id: "main".to_owned(),
            server_address: server_address.get_ref().clone(),
        },
        &request,
        payload,
    )
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let server_address = ChatServer::new().start();

    HttpServer::new(move || {
        App::new().app_data(Data::new(server_address.clone())).service(resource("/ws/").to(chat_route))
    })
    .workers(2)
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
