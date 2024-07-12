use std::env;

use diesel::r2d2::ConnectionManager;
use diesel::MysqlConnection;
use dotenvy::dotenv;
use r2d2::PooledConnection;

pub mod schema;
pub mod store;

pub type Pool = r2d2::Pool<ConnectionManager<MysqlConnection>>;
pub type Conn = PooledConnection<ConnectionManager<MysqlConnection>>;

pub fn create_connection_pool() -> Result<Pool, String> {
    dotenv().map_err(|e| e.to_string())?;

    let url = env::var("DATABASE_URL").map_err(|e| e.to_string())?;

    let manager = ConnectionManager::new(url);
    r2d2::Pool::builder().build(manager).map_err(|e| e.to_string())
}
