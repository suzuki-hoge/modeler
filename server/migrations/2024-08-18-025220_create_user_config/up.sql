create table user_config
(
    user_id                           varchar(36) primary key,
    reflect_page_object_on_text_input boolean not null,
    show_base_type_attributes         boolean not null,
    show_in_second_language           boolean not null,
    foreign key fk (user_id) references user (user_id) on delete cascade
) character set utf8mb4
  collate utf8mb4_bin;

insert into user_config (user_id, reflect_page_object_on_text_input, show_base_type_attributes, show_in_second_language)
values ('5e27fbd5-5f07-4b87-a5a4-5c26b440c643', true, true, true),
       ('dec0e1c1-fdba-4e72-91ea-5277abf4d126', true, true, false),
       ('0d10a12b-6d4a-45e0-a720-dc1d26343ef0', true, false, true),
       ('189b0fba-6ad3-44d8-ac65-0d8cde285a44', true, false, false),
       ('7e249a02-4a98-49ee-83bc-15d7891eed7d', false, true, true),
       ('433a4a88-c317-4577-8cdd-2b79eb11b48d', false, true, false),
       ('ca405dca-c687-4733-af9d-9224de9c3edc', false, false, true),
       ('e1af5cbd-e2aa-44cb-91df-92884541a5a5', false, false, false);
