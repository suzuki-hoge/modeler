// @generated automatically by Diesel CLI.

diesel::table! {
    foo (id) {
        #[max_length = 36]
        id -> Varchar,
        #[max_length = 255]
        name -> Nullable<Varchar>,
    }
}
