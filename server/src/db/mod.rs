use std::env;

use diesel::{Connection, MysqlConnection};
use dotenvy::dotenv;

pub mod schema;
pub mod store;

pub fn get_connection() -> Result<MysqlConnection, String> {
    dotenv().map_err(|e| e.to_string())?;

    let url = env::var("DATABASE_URL").map_err(|e| e.to_string())?;

    MysqlConnection::establish(&url).map_err(|e| e.to_string())
}
