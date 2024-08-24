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
       ('7c6174a1-d573-443b-bfd5-e918bfeffd39', 'f57d01c9-fe47-4d2e-95f3-b20791ee9b14', 'C', 'Controller', 'lightblue'),
       ('7c6174a1-d573-443b-bfd5-e918bfeffd39', '99c20c2b-b397-49a2-a4f3-9f4bda5305e8', 'UC', 'UseCase', 'lightcoral'),
       ('7c6174a1-d573-443b-bfd5-e918bfeffd39', 'b06e9df5-7976-4c86-93a4-0da098048495', 'R', 'Repository', 'lightcyan'),
       ('7c6174a1-d573-443b-bfd5-e918bfeffd39', 'b1de2c12-e5f4-4c26-9d61-4684d9093dd5', 'E', 'Entity', 'lightgreen'),
       ('7c6174a1-d573-443b-bfd5-e918bfeffd39', '9e82d42d-65f7-4c48-9901-9fcbdd4e3f74', 'E', 'Enum', 'lightpink'),
       ('7c6174a1-d573-443b-bfd5-e918bfeffd39', '9568e792-ea60-4244-8d57-b6336b1e0ca1', 'ID', 'Identity',
        'lightsalmon'),
       ('7c6174a1-d573-443b-bfd5-e918bfeffd39', 'ea054564-ab75-4839-88df-a92c981588a3', 'VO', 'ValueObject',
        'lightpink');
