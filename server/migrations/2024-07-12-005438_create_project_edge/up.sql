create table project_edge
(
    object_id  varchar(36) primary key,
    project_id varchar(36) not null,
    source     varchar(36) not null,
    target     varchar(36) not null,
    arrow_type varchar(36) not null,
    label      varchar(36) not null,
    foreign key fk1 (project_id) references project (project_id) on delete cascade,
    foreign key fk2 (source) references project_node (object_id) on delete cascade,
    foreign key fk3 (target) references project_node (object_id) on delete cascade
) character set utf8mb4
  collate utf8mb4_bin;
