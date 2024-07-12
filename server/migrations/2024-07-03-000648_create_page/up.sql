create table page
(
    page_id    varchar(36) primary key,
    project_id varchar(36)  not null,
    name       varchar(255) not null,
    foreign key fk (project_id) references project (project_id)
) character set utf8mb4
  collate utf8mb4_bin;

insert into page (page_id, project_id, name)
values ('3313e913-b0ab-4e3b-a35f-f1cf8ab625e1', '7c6174a1-d573-443b-bfd5-e918bfeffd39', 'クラス図１'),
       ('1c672dc5-6951-4712-a345-86f60f28a7b2', '7c6174a1-d573-443b-bfd5-e918bfeffd39', 'クラス図２'),
       ('36663da0-42d9-49aa-8326-babfa166cc7f', '3ac1ccff-fc6c-46fb-9aa3-ab0236875160', 'クラス図３'),
       ('cc702f17-fdc1-45c5-a1a6-8b7cddf6b017', '3ac1ccff-fc6c-46fb-9aa3-ab0236875160', 'クラス図４');
