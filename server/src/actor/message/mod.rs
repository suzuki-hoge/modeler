use std::collections::HashMap;

use serde_json::Value;

pub mod change;
pub mod connect;
pub mod disconnect;
pub mod lock;
pub mod unlock;

pub type Json = HashMap<String, Value>;

pub fn parse_string(map: &Json, key: &str) -> Result<String, String> {
    Ok(map.get(key).ok_or(format!("no such key: {key}"))?.as_str().unwrap().to_string())
}

pub fn parse_i64(map: &Json, key: &str) -> Result<i64, String> {
    map.get(key).ok_or(format!("no such key: {key}"))?.as_i64().ok_or(format!("invalid format: {key}"))
}

pub fn parse_usize(map: &Json, key: &str) -> Result<usize, String> {
    parse_i64(map, key).map(|v| v as usize)
}

#[cfg(test)]
mod tests {
    use serde_json::from_str as from_json_str;

    use crate::actor::message::{parse_i64, parse_string, Json};

    #[test]
    fn parse_string_ok() {
        let map: Json = from_json_str(
            r#"{
            "object_id": "b41738a8-a348-4cff-b1b6-34913a4e14f8"
        }"#,
        )
        .unwrap();

        let act = parse_string(&map, "object_id");

        assert_eq!(Ok(String::from("b41738a8-a348-4cff-b1b6-34913a4e14f8")), act);
    }

    #[test]
    fn parse_string_missing_err() {
        let map: Json = from_json_str(
            r#"{
        }"#,
        )
        .unwrap();

        let act = parse_string(&map, "object_id");

        assert_eq!(Err(String::from("no such key: object_id")), act);
    }

    #[test]
    fn parse_i64_ok() {
        let map: Json = from_json_str(
            r#"{
            "n": -42
        }"#,
        )
        .unwrap();

        let act = parse_i64(&map, "n");

        assert_eq!(Ok(-42), act);
    }

    #[test]
    fn parse_i64_missing_err() {
        let map: Json = from_json_str(
            r#"{
        }"#,
        )
        .unwrap();

        let act = parse_i64(&map, "n");

        assert_eq!(Err(String::from("no such key: n")), act);
    }

    #[test]
    fn parse_i64_format_err() {
        let map: Json = from_json_str(
            r#"{
            "n": "-42"
        }"#,
        )
        .unwrap();

        let act = parse_i64(&map, "n");

        assert_eq!(Err(String::from("invalid format: n")), act);
    }
}
