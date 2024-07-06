// @generated automatically by Diesel CLI.

diesel::table! {
    page (id) {
        #[max_length = 36]
        id -> Varchar,
        #[max_length = 36]
        project_id -> Varchar,
        #[max_length = 255]
        name -> Varchar,
    }
}

diesel::table! {
    page_node (id) {
        #[max_length = 36]
        id -> Varchar,
        #[max_length = 36]
        page_id -> Varchar,
        position -> Json,
    }
}

diesel::table! {
    project (id) {
        #[max_length = 36]
        id -> Varchar,
        #[max_length = 255]
        name -> Varchar,
    }
}

diesel::table! {
    project_node (id) {
        #[max_length = 36]
        id -> Varchar,
        #[max_length = 36]
        project_id -> Varchar,
        data -> Json,
    }
}

diesel::joinable!(page -> project (project_id));
diesel::joinable!(page_node -> page (page_id));
diesel::joinable!(project_node -> project (project_id));

diesel::allow_tables_to_appear_in_same_query!(
    page,
    page_node,
    project,
    project_node,
);
