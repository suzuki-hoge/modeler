create table project_node
(
    id         varchar(36) primary key,
    project_id varchar(36) not null,
    type       varchar(36) not null,
    data       text        not null,
    foreign key fk (project_id) references project (id)
) character set utf8mb4
  collate utf8mb4_bin;
