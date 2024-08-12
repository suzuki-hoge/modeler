use diesel::result::Error;

pub mod page;
pub mod project;

#[derive(Debug)]
pub enum DatabaseError {
    InvalidKey,
    UnexpectedRowMatched { count: usize },
    Other { origin: String },
}

impl DatabaseError {
    pub fn unexpected_row_matched(count: usize) -> Self {
        Self::UnexpectedRowMatched { count }
    }

    pub fn other(error: Error) -> Self {
        Self::Other { origin: error.to_string() }
    }

    pub fn show(self) -> String {
        match self {
            DatabaseError::InvalidKey => String::from("invalid key"),
            DatabaseError::UnexpectedRowMatched { .. } => String::from("unexpected row matched"),
            DatabaseError::Other { origin } => origin,
        }
    }
}
