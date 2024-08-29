create table user_project
(
    user_id                           varchar(36) not null,
    project_id                        varchar(36) not null,
    primary key (user_id, project_id),
    foreign key fk1 (user_id) references user (user_id) on delete cascade,
    foreign key fk2 (project_id) references project (project_id) on delete cascade
) character set utf8mb4
  collate utf8mb4_bin;
