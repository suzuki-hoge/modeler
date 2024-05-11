use std::time::Instant;

use actix::{Actor, Addr};
use actix_web::web::Path;
use actix_web::{
    web::{Data, Payload},
    Error, HttpRequest, HttpResponse,
};
use actix_web_actors::ws::start;

use crate::actor::server::Server;
use crate::actor::session::{create_session_id, Session};
use crate::data::User;

mod message;
mod server;
mod session;

type PageId = String;
type SessionId = String;

pub async fn start_session(
    request: HttpRequest,
    payload: Payload,
    path: Path<(PageId, User)>,
    server_address: Data<Addr<Server>>,
) -> Result<HttpResponse, Error> {
    let path = path.into_inner();
    start(
        Session {
            session_id: create_session_id(),
            user: path.1,
            page_id: path.0,
            server_address: server_address.get_ref().clone(),
            last_heartbeat: Instant::now(),
        },
        &request,
        payload,
    )
}

pub fn start_server() -> Addr<Server> {
    Server::new().start()
}