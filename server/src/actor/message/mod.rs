use std::collections::HashMap;

use serde_json::Value;

pub mod connection;
pub mod page;
pub mod project;

pub type Json = HashMap<String, Value>;

pub fn parse_string(json: &Json, key: &str) -> Result<String, String> {
    Ok(json.get(key).ok_or(format!("no such key: {key}"))?.as_str().unwrap().to_string())
}

pub fn parse_i64(json: &Json, key: &str) -> Result<i64, String> {
    json.get(key).ok_or(format!("no such key: {key}"))?.as_i64().ok_or(format!("invalid format: {key}"))
}

pub fn parse_f64(json: &Json, key: &str) -> Result<f64, String> {
    json.get(key).ok_or(format!("no such key: {key}"))?.as_f64().ok_or(format!("invalid format: {key}"))
}

pub fn parse_strings(json: &Json, key: &str) -> Result<Vec<String>, String> {
    let values = json
        .get(key)
        .ok_or(format!("no such key: {key}"))?
        .as_array()
        .ok_or(format!("invalid format: {key}"))?
        .to_vec();
    Ok(values.into_iter().map(|v| v.as_str().unwrap().to_string()).collect())
}

#[cfg(test)]
mod tests {
    use serde_json::from_str as from_json_str;

    use crate::actor::message::{parse_f64, parse_i64, parse_string, parse_strings, Json};

    #[test]
    fn parse_string_ok() {
        let json: Json = from_json_str(r#"{"value": "abc"}"#).unwrap();

        let act = parse_string(&json, "value");

        assert_eq!(Ok(String::from("abc")), act);
    }

    #[test]
    fn parse_string_missing_err() {
        let json: Json = from_json_str(r#"{}"#).unwrap();

        let act = parse_string(&json, "value");

        assert_eq!(Err(String::from("no such key: value")), act);
    }

    #[test]
    fn parse_i64_ok() {
        let json: Json = from_json_str(r#"{"n": -42}"#).unwrap();

        let act = parse_i64(&json, "n");

        assert_eq!(Ok(-42), act);
    }

    #[test]
    fn parse_i64_missing_err() {
        let json: Json = from_json_str(r#"{}"#).unwrap();

        let act = parse_i64(&json, "n");

        assert_eq!(Err(String::from("no such key: n")), act);
    }

    #[test]
    fn parse_i64_format_err() {
        let json: Json = from_json_str(r#"{"n": "-42"}"#).unwrap();

        let act = parse_i64(&json, "n");

        assert_eq!(Err(String::from("invalid format: n")), act);
    }

    #[test]
    fn parse_f64_ok() {
        let json: Json = from_json_str(r#"{"n": -42.195}"#).unwrap();

        let act = parse_f64(&json, "n");

        assert_eq!(Ok(-42.195), act);
    }

    #[test]
    fn parse_f64_missing_err() {
        let json: Json = from_json_str(r#"{}"#).unwrap();

        let act = parse_f64(&json, "n");

        assert_eq!(Err(String::from("no such key: n")), act);
    }

    #[test]
    fn parse_f64_format_err() {
        let json: Json = from_json_str(r#"{"n": "-42.195"}"#).unwrap();

        let act = parse_f64(&json, "n");

        assert_eq!(Err(String::from("invalid format: n")), act);
    }

    #[test]
    fn parse_strings_ok() {
        let json: Json = from_json_str(r#"{"values": ["abc", "xyz"]}"#).unwrap();

        let act = parse_strings(&json, "values");

        assert_eq!(Ok(vec![String::from("abc"), String::from("xyz")]), act);
    }

    #[test]
    fn parse_strings_missing_err() {
        let json: Json = from_json_str(r#"{}"#).unwrap();

        let act = parse_strings(&json, "values");

        assert_eq!(Err(String::from("no such key: values")), act);
    }

    #[test]
    fn parse_strings_format_err() {
        let json: Json = from_json_str(r#"{"values": "abc"}"#).unwrap();

        let act = parse_strings(&json, "values");

        assert_eq!(Err(String::from("invalid format: values")), act);
    }
}
