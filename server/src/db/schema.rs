// @generated automatically by Diesel CLI.

diesel::table! {
    node_icon (project_id, id) {
        #[max_length = 36]
        project_id -> Varchar,
        #[max_length = 36]
        id -> Varchar,
        #[max_length = 36]
        preview -> Varchar,
        #[max_length = 36]
        desc -> Varchar,
        #[max_length = 36]
        color -> Varchar,
    }
}

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
    page_edge (object_id, page_id) {
        #[max_length = 36]
        object_id -> Varchar,
        #[max_length = 36]
        page_id -> Varchar,
        #[max_length = 36]
        source -> Varchar,
        #[max_length = 36]
        target -> Varchar,
    }
}

diesel::table! {
    page_node (object_id, page_id) {
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
    project_edge (object_id) {
        #[max_length = 36]
        object_id -> Varchar,
        #[max_length = 36]
        project_id -> Varchar,
        #[max_length = 36]
        source -> Varchar,
        #[max_length = 36]
        target -> Varchar,
        #[max_length = 36]
        arrow_type -> Varchar,
        #[max_length = 36]
        label -> Varchar,
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

diesel::joinable!(node_icon -> project (project_id));
diesel::joinable!(page -> project (project_id));
diesel::joinable!(page_edge -> page (page_id));
diesel::joinable!(page_edge -> project_edge (object_id));
diesel::joinable!(page_node -> page (page_id));
diesel::joinable!(page_node -> project_node (object_id));
diesel::joinable!(project_edge -> project (project_id));
diesel::joinable!(project_node -> project (project_id));

diesel::allow_tables_to_appear_in_same_query!(
    node_icon,
    page,
    page_edge,
    page_node,
    project,
    project_edge,
    project_node,
);
