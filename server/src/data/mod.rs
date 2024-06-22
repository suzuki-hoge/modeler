use serde::Serialize;

pub mod edge;
pub mod node;
pub mod page;

pub type ProjectId = String;
pub type PageId = String;
pub type ObjectId = String;

pub type User = String;

#[derive(Serialize)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}
