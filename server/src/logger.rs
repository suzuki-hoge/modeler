use std::fs::{remove_file, OpenOptions};
use std::io::Write;

use chrono::prelude::Utc;
use chrono::FixedOffset;
use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::SessionId;
use crate::data::user::UserId;

enum Log {
    HttpStart { url: String },
    HttpError { body: String },
    HttpEnd { status: u16 },
    Accept { r#type: String, body: String },
    Broadcast { r#type: String, to: String, body: String },
    Information { r#type: String, body: String },
}
impl Log {
    fn ltsv(self) -> String {
        match self {
            Log::HttpStart { url } => format!("type:http-start\turl:{}", url),
            Log::HttpError { body } => format!("type:http-error\tbody:{}", body),
            Log::HttpEnd { status } => format!("type:http-end\tstatus:{}", status),
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

pub fn http_start<S: Into<String>>(user_id: &UserId, url: S) {
    out("user_id", user_id, Log::HttpStart { url: url.into() }, true);
}

pub fn http_error<S: Into<String>>(user_id: &UserId, message: S) {
    out("user_id", user_id, Log::HttpError { body: message.into() }, false);
}

pub fn http_end(user_id: &UserId, status: u16) {
    out("user_id", user_id, Log::HttpEnd { status }, true);
}

pub fn accept<Request: Serialize>(session_id: &SessionId, r#type: &str, request: &Request) {
    out(
        "session_id",
        session_id,
        Log::Accept { r#type: r#type.to_string(), body: to_json_string(request).unwrap() },
        true,
    );
}

pub fn broadcast(session_id: &SessionId, r#type: &String, to: &SessionId, json: &String) {
    out(
        "session_id",
        session_id,
        Log::Broadcast { r#type: r#type.to_string(), to: to.to_string(), body: json.to_string() },
        true,
    );
}

pub fn information<S: Into<String>>(session_id: &SessionId, r#type: &String, message: S) {
    out("session_id", session_id, Log::Information { r#type: r#type.to_string(), body: message.into() }, true);
}

pub fn session_error<S: Into<String>>(session_id: &SessionId, r#type: &str, message: S) {
    out("session_id", session_id, Log::Information { r#type: r#type.to_string(), body: message.into() }, false);
}

fn out(id_name: &str, id_value: &String, log: Log, success: bool) {
    let now = Utc::now().with_timezone(&FixedOffset::east_opt(9 * 3600).unwrap()).format("%Y/%m/%d %H:%M:%S");
    let line = format!("time:{}\t{}:{}\t{}", now, id_name, id_value, log.ltsv());

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
