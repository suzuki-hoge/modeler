create table page_node
(
    object_id varchar(36) primary key,
    page_id   varchar(36) not null,
    x         varchar(10) not null,
    y         varchar(10) not null,
    foreign key fk (page_id) references page (page_id)
) character set utf8mb4
  collate utf8mb4_bin;
