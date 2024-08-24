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
use crate::data::page::PageId;
use crate::data::project::ProjectId;
use crate::data::user::UserId;
use crate::db::Pool;

mod message;
mod server;
mod session;

pub type SessionId = String;

pub async fn start_session(
    request: HttpRequest,
    payload: Payload,
    path: Path<(ProjectId, PageId, UserId)>,
    server_address: Data<Addr<Server>>,
) -> Result<HttpResponse, Error> {
    let (project_id, page_id, user_id) = path.into_inner();
    start(
        Session {
            session_id: create_session_id(),
            user_id,
            project_id,
            page_id,
            server_address: server_address.get_ref().clone(),
            last_heartbeat: Instant::now(),
        },
        &request,
        payload,
    )
}

pub fn start_server(pool: Pool) -> Addr<Server> {
    Server::new(pool).start()
}
