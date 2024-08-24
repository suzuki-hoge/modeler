use std::fs::File;
use std::io::BufReader;

use actix_web::web::Data;
use actix_web::HttpResponse;
use itertools::Itertools;
use serde_json::{from_reader, json, Value};

use crate::db::store::page::page_store;
use crate::db::store::project::project_store;
use crate::db::Pool;
use crate::logger;

pub async fn session(pool: Data<Pool>) -> HttpResponse {
    logger::get("john".to_string(), "/debug/session");

    let projects = project_store::find_all(&mut pool.get().unwrap())
        .unwrap()
        .into_iter()
        .map(|project| {
            let pages = page_store::find_pages(&mut pool.get().unwrap(), &project.project_id)
                .unwrap()
                .into_iter()
                .map(|page| json!({"pageId": page.page_id, "name": page.name}))
                .collect_vec();

            json!({"projectId": project.project_id,"name": project.name,"pages": pages})
        })
        .collect_vec();

    let file = File::open("/tmp/modeler-server.json").unwrap();
    let reader = BufReader::new(file);
    let sessions: Value = from_reader(reader).unwrap();

    let json = json!({"projects": projects,"sessions": sessions});

    HttpResponse::Ok().json(json)
}
