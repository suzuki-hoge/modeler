create table page_edge
(
    object_id     varchar(36) not null,
    page_id       varchar(36) not null,
    object_type   varchar(36) not null,
    source        varchar(36) not null,
    target        varchar(36) not null,
    source_handle varchar(36) not null,
    target_handle varchar(36) not null,
    primary key (object_id, page_id),
    foreign key fk1 (object_id) references project_edge (object_id) on delete cascade,
    foreign key fk2 (page_id) references page (page_id) on delete cascade,
    foreign key fk3 (source) references project_node (object_id) on delete cascade,
    foreign key fk4 (target) references project_node (object_id) on delete cascade
) character set utf8mb4
  collate utf8mb4_bin;
