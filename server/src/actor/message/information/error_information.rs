use serde::Serialize;
use serde_json::to_string as to_json_string;

use crate::actor::session::Response;

pub const TYPE: &str = "error-information";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ErrorInformationResponse {
    r#type: String,
    message: String,
}

impl ErrorInformationResponse {
    pub fn new(message: String) -> Self {
        Self { r#type: TYPE.to_string(), message }
    }
}

impl From<ErrorInformationResponse> for Response {
    fn from(value: ErrorInformationResponse) -> Self {
        Self { r#type: TYPE.to_string(), json: to_json_string(&value).unwrap() }
    }
}
