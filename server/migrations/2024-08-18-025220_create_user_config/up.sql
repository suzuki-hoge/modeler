create table user_config
(
    user_id                           varchar(36) primary key,
    reflect_page_object_on_text_input boolean not null,
    show_base_type_attributes         boolean not null,
    show_in_second_language           boolean not null,
    foreign key fk (user_id) references user (user_id) on delete cascade
) character set utf8mb4
  collate utf8mb4_bin;
