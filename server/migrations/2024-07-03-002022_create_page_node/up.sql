create table page_node
(
    object_id varchar(36) not null,
    page_id   varchar(36) not null,
    x         varchar(36) not null,
    y         varchar(36) not null,
    primary key (object_id, page_id),
    foreign key fk1 (object_id) references project_node (object_id) on delete cascade,
    foreign key fk2 (page_id) references page (page_id) on delete cascade
) character set utf8mb4
  collate utf8mb4_bin;
