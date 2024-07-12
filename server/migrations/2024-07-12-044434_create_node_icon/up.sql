create table node_icon
(
    project_id varchar(36) not null,
    id         varchar(36) not null,
    preview    varchar(36) not null,
    `desc`     varchar(36) not null,
    color      varchar(36) not null,
    primary key (project_id, id),
    foreign key fk (project_id) references project (project_id) on delete cascade
) character set utf8mb4
  collate utf8mb4_bin;
