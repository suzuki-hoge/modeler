use std::fs::{remove_file, OpenOptions};
use std::io::Write;

use chrono::prelude::Utc;
use chrono::FixedOffset;
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::SessionId;

enum Log {
    Get { url: String },
    Accept { r#type: String, body: String },
    Broadcast { r#type: String, to: String, body: String },
    Information { r#type: String, body: String },
}
impl Log {
    fn ltsv(self) -> String {
        match self {
            Log::Get { url } => format!("type:get\turl:{}", url),
            Log::Accept { r#type, body } => format!("type:accept\tdetail:{}\tbody:{}", r#type, body),
            Log::Broadcast { r#type, to, body } => {
                format!("type:broadcast\tdetail:{}\tto:{}\tbody:{}", r#type, to, body)
            }
            Log::Information { r#type, body } => format!("type:information\tdetail:{}\tbody:{}", r#type, body),
        }
    }
}

pub fn init() {
    let _ = remove_file("/tmp/modeler-server.log");
}

pub fn get<S: Into<String>>(user: String, url: S) {
    out(user, Log::Get { url: url.into() }, true);
}

pub fn accept<Request: Serialize>(user: String, r#type: &str, request: &Request) {
    out(user, Log::Accept { r#type: r#type.to_string(), body: to_json_string(request).unwrap() }, true);
}

pub fn broadcast(user: String, r#type: &String, to: &SessionId, json: &String) {
    out(user, Log::Broadcast { r#type: r#type.to_string(), to: to.to_string(), body: json.to_string() }, true);
}

pub fn information<Response: Serialize>(user: String, r#type: &String, response: &Response) {
    out(user, Log::Information { r#type: r#type.to_string(), body: to_json_string(response).unwrap() }, true);
}

pub fn error<Response: Serialize>(user: String, r#type: &str, response: &Response) {
    out(user, Log::Information { r#type: r#type.to_string(), body: to_json_string(response).unwrap() }, false);
}

fn out(user: String, log: Log, success: bool) {
    let now = Utc::now().with_timezone(&FixedOffset::east_opt(9 * 3600).unwrap()).format("%Y/%m/%d %H:%M:%S");
    let line = format!("time:{}\tuser:{}\t{}", now, user, log.ltsv());

    if true {
        local_stdout(&line, success);
        file(&line);
    } else {
        stdout(&line);
    }
}

fn stdout(line: &str) {
    println!("{}", line);
}

fn local_stdout(line: &str, success: bool) {
    match success {
        true => println!("{}", line.replace('\t', "    ")),
        false => eprintln!("{}", line.replace('\t', "    ")),
    }
}

fn file(line: &str) {
    let mut file = OpenOptions::new().create(true).append(true).open("/tmp/modeler-server.log").unwrap();
    file.write_all(format!("{line}\n").as_bytes()).unwrap();
}
