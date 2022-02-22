begin;

create table if not exists settings (
  uuid            boolean         primary key default true,
  bugreport       boolean         default true,
  resetpass       boolean         default false,
  token_duration  int             default 1440
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
  name        varchar(64)     default '',
  avatar      varchar(36)     default '',
  email       varchar(128)    not null,
  mobile      varchar(16)     not null,
  address     varchar(256)    default '',
  tfa         boolean         not null default true,
  acl         varchar(36)     not null,
  secretcode  varchar(256)    not null default '',
  totp_secret varchar(256)    not null default '',
  n_signin    int             not null default 0
);

create table if not exists signin_history (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  user_uuid   varchar(36)     not null,
  userid      varchar(128)    not null,
  name        varchar(64)     not null,
  ip          varchar(128)    not null,
  country     varchar(64),
  province    varchar(64),
  city        varchar(64),
  district    varchar(64),
  longitude   float,
  latitude    float,
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
  '7e9633f6-c83a-49a4-9a96-e120d6ca6055', 0, '系统管理', '可以访问系统所有功能'
);

create table if not exists acl_allows (
  uuid        varchar(36)     primary key not null,
  acl         varchar(36)     not null,
  code        int             not null,
  title       varchar(64)     not null,
  url         varchar(128)    not null,
  iread       boolean         not null default true,
  iwrite      boolean         not null default false,
  iadmin      boolean         not null default false
);

create unique index acl_allows_acl_code on acl_allows(acl, code);
create unique index acl_allows_acl_url on acl_allows(acl, url);

insert into acl_allows (
  uuid, acl, code, title, url, iread, iwrite, iadmin
) values (
  'd17a5324-63d4-4bdb-998e-c5ec52c80bc1', '7e9633f6-c83a-49a4-9a96-e120d6ca6055',
  9000, '用户管理', '/system/user', true, true, true
);
insert into acl_allows (
  uuid, acl, code, title, url, iread, iwrite, iadmin
) values (
  '669d23b1-be43-40c8-8f7f-c013d217b1e8', '7e9633f6-c83a-49a4-9a96-e120d6ca6055',
  9010, '访问控制', '/system/acl', true, true, true
);

create table if not exists sms_settings (
  appid       varchar(32)     not null default '',
  secret_id   varchar(64)     not null default '',
  secret_key  varchar(64)     not null default '',
  sign        varchar(32)     not null default '',
  msgid1      varchar(32)     not null default ''
);

insert into sms_settings (appid) values ('');

create table if not exists mtas (
  uuid        varchar(36)     primary key not null,
  name        varchar(32)     not null unique,
  host        varchar(128)    not null,
  port        int             not null default 465,
  sslmode     boolean         not null default true,
  sender      varchar(128)    not null,
  replyto     varchar(128),
  username    varchar(128),
  passwd      varchar(128),
  cc          text,
  bcc         text,
  prefix      varchar(128)    default '',
  sortno      int             unique,
  nsent       int             default 0
);

create table if not exists events (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  level       int             not null,
  title       varchar(64)     not null,
  message     text            not null,
  fresh       boolean         not null default true
);

create table if not exists tasks (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  update_at   timestamp       not null default current_timestamp,
  name        varchar(64)     not null,
  summary     varchar(256)    not null,
  cron        varchar(64)     not null,
  type        smallint        not null,
  path        varchar(256)    not null,
  last_fire   timestamp       not null default current_timestamp,
  nfire       int             not null default 0,
  disabled    boolean         not null default false,
  note        text
);

create table if not exists images (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  update_at   timestamp       not null default current_timestamp,
  data        bytea           not null, -- PostgreSQL, Sqlite
  -- data        mediumblob      not null,  -- MySQL
  mime        varchar(128)    not null,
  etag        varchar(32)     not null
);

create table if not exists geoip (
  webkey      varchar(128)
);

insert into geoip (webkey) values ('');

create table if not exists tree (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  update_at   timestamp       not null default current_timestamp,
  name        varchar(64)     not null,
  summary     varchar(256)    not null,
  up          varchar(36)     not null default '',
  tpath       text            not null,
  nlevel      int             not null,
  disabled    boolean         default false,
  sortno      int             not null
);

create unique index tree_level_sortno on tree(nlevel, sortno);
-- MySQL 不支持下面的语句
-- https://stackoverflow.com/questions/1827063
create unique index tree_path on tree(tpath);

insert into tree (uuid, name, summary, tpath, nlevel, sortno) values (
  '6e0c44c6-08ef-48d8-b48e-69c9903cc3f1', '根', '根节点', '0', 1, 1
);

commit;
