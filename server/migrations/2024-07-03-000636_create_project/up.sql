create table project
(
    project_id varchar(36) primary key,
    name       varchar(255) not null
) character set utf8mb4
  collate utf8mb4_bin;

insert into project (project_id, name)
values ('7c6174a1-d573-443b-bfd5-e918bfeffd39', 'プロジェクト１'),
       ('3ac1ccff-fc6c-46fb-9aa3-ab0236875160', 'プロジェクト２');
