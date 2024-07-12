create table project_node
(
    object_id  varchar(36) primary key,
    project_id varchar(36) not null,
    name       varchar(36) not null,
    icon_id    varchar(36) not null,
    properties text        not null,
    methods    text        not null,
    foreign key fk (project_id) references project (project_id)
) character set utf8mb4
  collate utf8mb4_bin;
