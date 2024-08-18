create table user
(
    user_id varchar(36) primary key,
    name    varchar(36),
    icon    varchar(256)
) character set utf8mb4
  collate utf8mb4_bin;

insert into user (user_id, name, icon)
values ('5e27fbd5-5f07-4b87-a5a4-5c26b440c643', 'とりさん',
        'https://i.pinimg.com/236x/34/cb/19/34cb19dcb8a22bb6178573793b21de95.jpg'),
       ('dec0e1c1-fdba-4e72-91ea-5277abf4d126', 'いぬくん',
        'https://i.pinimg.com/236x/fd/24/6b/fd246bd369099f2f810fbd625cf25379.jpg'),
       ('0d10a12b-6d4a-45e0-a720-dc1d26343ef0', 'うさぎさん',
        'https://i.pinimg.com/236x/e3/59/a9/e359a997a9147cb901f40a939297c22b.jpg'),
       ('189b0fba-6ad3-44d8-ac65-0d8cde285a44', 'ぺん',
        'https://i.pinimg.com/236x/a4/da/f1/a4daf1f9d6e4acf13ff81d708edfe415.jpg'),
       ('7e249a02-4a98-49ee-83bc-15d7891eed7d', 'にせオルトロス',
        'https://i.pinimg.com/236x/16/8a/cd/168acd0d1b1d020c7911cc499a784bd5.jpg'),
       ('433a4a88-c317-4577-8cdd-2b79eb11b48d', 'じんべぇ',
        'https://i.pinimg.com/236x/af/9c/d5/af9cd50c10cfd1bed54e7b1b37600c5c.jpg'),
       ('ca405dca-c687-4733-af9d-9224de9c3edc', 'ねこさん',
        'https://i.pinimg.com/236x/29/d7/f5/29d7f5efcaaab3cbdf9745f3dd565d1a.jpg'),
       ('e1af5cbd-e2aa-44cb-91df-92884541a5a5', 'うりぼー',
        'https://i.pinimg.com/236x/39/eb/1b/39eb1b442e534f2901d944699e17dd06.jpg');
