create table page_node
(
    id       varchar(36) primary key,
    page_id  varchar(36) not null,
    type     varchar(36) not null,
    position text        not null,
    foreign key fk (page_id) references page (id)
) character set utf8mb4
  collate utf8mb4_bin;
