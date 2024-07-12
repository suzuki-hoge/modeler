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

insert into node_icon (project_id, id, preview, `desc`, color)
values ('7c6174a1-d573-443b-bfd5-e918bfeffd39', 'default', 'C', 'Class', 'lightgray'),
       ('7c6174a1-d573-443b-bfd5-e918bfeffd39', 'fb951145-bea1-4934-b44f-bdaa63c79763', 'C', 'Controller', 'lightgray'),
       ('7c6174a1-d573-443b-bfd5-e918bfeffd39', '9a64593c-98d7-4420-b5ae-d2b022b345f9', 'UC', 'UseCase', 'lightcyan'),
       ('7c6174a1-d573-443b-bfd5-e918bfeffd39', '50c9f120-6d07-4bb2-a935-bc674e18d137', 'S', 'Store', 'lightgreen'),
       ('7c6174a1-d573-443b-bfd5-e918bfeffd39', '5cc0cdfc-fd4f-405c-b383-1d54f3f1c4b7', 'D', 'Data', 'lightpink');
