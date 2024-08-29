use std::fs::{remove_file, OpenOptions};
use std::io::Write;

use chrono::prelude::Utc;
use chrono::FixedOffset;
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::SessionId;
use crate::data::user::UserId;

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

pub fn get<S: Into<String>>(user_id: &UserId, url: S) {
    out(user_id, Log::Get { url: url.into() }, true);
}

pub fn accept<Request: Serialize>(user_id: &UserId, r#type: &str, request: &Request) {
    out(user_id, Log::Accept { r#type: r#type.to_string(), body: to_json_string(request).unwrap() }, true);
}

pub fn broadcast(user_id: &UserId, r#type: &String, to: &SessionId, json: &String) {
    out(user_id, Log::Broadcast { r#type: r#type.to_string(), to: to.to_string(), body: json.to_string() }, true);
}

pub fn information<S: Into<String>>(user_id: &UserId, r#type: &String, message: S) {
    out(user_id, Log::Information { r#type: r#type.to_string(), body: message.into() }, true);
}

pub fn error<S: Into<String>>(user_id: &UserId, r#type: &str, message: S) {
    out(user_id, Log::Information { r#type: r#type.to_string(), body: message.into() }, false);
}

fn out(user_id: &UserId, log: Log, success: bool) {
    let now = Utc::now().with_timezone(&FixedOffset::east_opt(9 * 3600).unwrap()).format("%Y/%m/%d %H:%M:%S");
    let line = format!("time:{}\tuser_id:{}\t{}", now, user_id, log.ltsv());

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
