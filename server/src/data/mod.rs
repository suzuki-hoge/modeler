use serde::{Deserialize, Serialize};

pub mod edge;
pub mod node;
pub mod page;
pub mod project;
pub mod user;

pub type ObjectId = String;

#[derive(Serialize, Deserialize, PartialEq, Clone, Debug)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}
