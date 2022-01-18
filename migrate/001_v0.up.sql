begin;

create table if not exists settings (
  uuid        boolean         primary key default true,
  resetpass   boolean         default false
);

insert into settings (uuid) values (true);

create table if not exists users (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  update_at   timestamp       not null default current_timestamp,
  signin_at   timestamp       not null default current_timestamp,
  disabled    boolean         not null default false,
  deleted     boolean         not null default false,
  userid      varchar(128)    unique not null,
  passwd      varchar(256)    not null,
  name        varchar(64),
  email       varchar(128)    not null,
  mobile      varchar(16)     not null,
  address     varchar(256),
  tfa         boolean         not null default true,
  acl         varchar(36)     not null,
  n_signin    int             not null default 0
);

create table if not exists signin_history (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  user_uuid   varchar(36)     not null,
  userid      varchar(128)    not null,
  name        varchar(64)     not null,
  ip          varchar(128)    not null,
  city        varchar(64),
  ua          varchar(512)    not null
);

create table if not exists acl (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  update_at   timestamp       not null default current_timestamp,
  code        int             not null unique,
  name        varchar(64)     not null unique,
  summary     varchar(512)    not null
);

insert into acl (uuid, code, name, summary) values (
  '7e9633f6-c83a-49a4-9a96-e120d6ca6055', 0,
  '系统管理', '可以访问系统所有功能，仅对系统负责人员开放'
);

create table if not exists acl_allows (
  uuid        varchar(36)     primary key not null,
  acl         varchar(36)     not null,
  code        int             not null,
  title       varchar(64)     not null,
  url         varchar(128)    not null,
  read        boolean         not null default true,
  write       boolean         not null default false,
  admin       boolean         not null default false
);

create unique index acl_allows_acl_code on acl_allows(acl, code);
create unique index acl_allows_acl_url on acl_allows(acl, url);

insert into acl_allows (uuid, acl, code, title, url, read, write, admin) values (
  gen_random_uuid(), '7e9633f6-c83a-49a4-9a96-e120d6ca6055',
  700, '用户管理', '/system/user', true, true, true
);
insert into acl_allows (uuid, acl, code, title, url, read, write, admin) values (
  gen_random_uuid(), '7e9633f6-c83a-49a4-9a96-e120d6ca6055',
  701, '添加用户', '/system/user/add', true, true, true
);
insert into acl_allows (uuid, acl, code, title, url, read, write, admin) values (
  gen_random_uuid(), '7e9633f6-c83a-49a4-9a96-e120d6ca6055',
  710, '访问控制', '/system/acl', true, true, true
);
insert into acl_allows (uuid, acl, code, title, url, read, write, admin) values (
  gen_random_uuid(), '7e9633f6-c83a-49a4-9a96-e120d6ca6055',
  711, '添加角色', '/system/acl/add', true, true, true
);

commit;
