// @generated automatically by Diesel CLI.

diesel::table! {
    page (page_id) {
        #[max_length = 36]
        page_id -> Varchar,
        #[max_length = 36]
        project_id -> Varchar,
        #[max_length = 255]
        name -> Varchar,
    }
}

diesel::table! {
    page_node (object_id) {
        #[max_length = 36]
        object_id -> Varchar,
        #[max_length = 36]
        page_id -> Varchar,
        #[max_length = 10]
        x -> Varchar,
        #[max_length = 10]
        y -> Varchar,
    }
}

diesel::table! {
    project (project_id) {
        #[max_length = 36]
        project_id -> Varchar,
        #[max_length = 255]
        name -> Varchar,
    }
}

diesel::table! {
    project_node (object_id) {
        #[max_length = 36]
        object_id -> Varchar,
        #[max_length = 36]
        project_id -> Varchar,
        #[max_length = 36]
        name -> Varchar,
        #[max_length = 36]
        icon_id -> Varchar,
        properties -> Text,
        methods -> Text,
    }
}

diesel::joinable!(page -> project (project_id));
diesel::joinable!(page_node -> page (page_id));
diesel::joinable!(project_node -> project (project_id));

diesel::allow_tables_to_appear_in_same_query!(page, page_node, project, project_node,);
