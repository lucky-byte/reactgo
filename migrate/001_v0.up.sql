begin;

create table if not exists serials (
  n           bigint          default 0
);
insert into serials (n) values (0);

create table if not exists debug (
  debug       boolean         default true
);
insert into debug (debug) values (true);

create table if not exists image_store (
  place       int             not null default 1,
                              -- 1. 数据库
                              -- 2. 文件系统
  rootpath    varchar(256)    not null default ''
);
insert into image_store (place) values (1);

create table if not exists users (
  uuid            varchar(36)     primary key not null,
  create_at       timestamp       not null default current_timestamp,
  update_at       timestamp       not null default current_timestamp,
  signin_at       timestamp       not null default current_timestamp,
  disabled        boolean         not null default false,
  deleted         boolean         not null default false,
  userid          varchar(128)    unique not null,
  passwd          varchar(256)    not null,
  name            varchar(64)     default '',
  avatar          varchar(36)     default '',
  email           varchar(128)    not null,
  mobile          varchar(16)     not null,
  idno            varchar(32)     not null default '',
  address         varchar(256)    default '',
  acct_name       varchar(64)     default '',
  acct_no         varchar(64)     default '',
  acct_idno       varchar(64)     default '',
  acct_mobile     varchar(16)     default '',
  acct_bank_name  varchar(256)    default '',
  tfa             boolean         not null default true,
  acl             varchar(36)     not null,
  secretcode      varchar(256)    not null default '',
  totp_secret     varchar(256)    not null default '',
  n_signin        int             not null default 0,
  noti_popup      boolean         default true,
  noti_browser    boolean         default false,
  noti_mail       boolean         default false
);

create table if not exists signin_history (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  user_uuid   varchar(36)     not null,
  userid      varchar(128)    not null,
  name        varchar(64)     not null,
  ip          varchar(128)    not null default '',
  country     varchar(64)     default '',
  province    varchar(64)     default '',
  city        varchar(64)     default '',
  district    varchar(64)     default '',
  longitude   float           default 0,
  latitude    float           default 0,
  ua          varchar(512)    not null default '',
  clientid    varchar(36)     not null,
  trust       boolean,
  tfa         int             default 0,
                              -- 0. 无
                              -- 1. 短信
                              -- 2. 动态密码
  act_type    int             not null default 1,
                              -- 1. 系统账号登录
                              -- 2. 三方账号登录
  oauthp      varchar(32)     not null default ''
);

create table if not exists acl (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  update_at   timestamp       not null default current_timestamp,
  code        int             not null unique,
  name        varchar(64)     not null unique,
  summary     varchar(512)    not null,
  features    text            not null
);

insert into acl (uuid, code, name, summary, features) values (
  '7e9633f6-c83a-49a4-9a96-e120d6ca6055', 0, '系统管理', '可以访问系统所有功能', 'event'
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

create table if not exists mtas (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  update_at   timestamp       not null default current_timestamp,
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
  nsent       int             default 0,
  disabled    boolean         default false
);

create table if not exists smss (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  update_at   timestamp       not null default current_timestamp,
  isp         varchar(16)     not null,
  isp_name    varchar(64)     not null,
  appid       varchar(32)     not null default '',
  secret_id   varchar(64)     not null default '',
  secret_key  varchar(64)     not null default '',
  prefix      varchar(32)     not null default '',
  textno1     varchar(32)     not null default '',
  sortno      int             unique,
  nsent       int             default 0,
  disabled    boolean         default false
);

create table if not exists account (
  signupable    boolean         default false,
  signupacl     varchar(36)     default '',
  lookuserid    boolean         default true,
  resetpass     boolean         default true,
  sessduration  int             default 1440,
  jwtsignkey    varchar(32)     default '',
  jwtsignkey2   varchar(32)     default ''
);

insert into account (lookuserid) values (true);

create table if not exists events (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  level       int             not null,
  title       varchar(256)    not null,
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
  place       int             not null default 1,
                              -- 1. 数据库
                              -- 2. 文件系统
  data        bytea           not null, -- PostgreSQL, Sqlite
  -- data        mediumblob      not null, -- MySQL
  path        varchar(256)    not null default '',
  mime        varchar(128)    not null,
  etag        varchar(32)     not null
);

create table if not exists geoip (
  amap_webkey     varchar(128) default '',
  amap_enable     boolean default false,
  amap_apiver     varchar(8) default 'v3',
  tencent_webkey  varchar(128) default '',
  tencent_enable  boolean default false
);

insert into geoip (amap_webkey) values ('');

create table if not exists tree (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  update_at   timestamp       not null default current_timestamp,
  name        varchar(64)     not null,
  summary     varchar(256)    not null default '',
  up          varchar(36)     not null default '',
  tpath       text            not null,
  tpath_hash  varchar(32)     not null,
  nlevel      int             not null,
  disabled    boolean         default false,
  sortno      int             not null
);

create unique index tree_path_hash on tree(tpath_hash);

insert into tree (uuid, name, summary, tpath, tpath_hash, nlevel, sortno) values (
  '6e0c44c6-08ef-48d8-b48e-69c9903cc3f1',
  '根', '根节点', '0', 'cfcd208495d565ef66e7dff9f98764da', 1, 1
);

create table if not exists tree_bind (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  node        varchar(36)     not null,
  entity      varchar(36)     not null,
  type        int             not null
);

create unique index tree_bind_node_entity_type on tree_bind(node, entity, type);

create table if not exists tickets (
  keyid       varchar(64)     primary key not null,
  create_at   bigint          not null,
  expiry_at   bigint          not null,
  code        varchar(64)     not null,
  failed      int             not null default 0,
  user_data   varchar(128)
);

create table if not exists bulletins (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  user_uuid   varchar(36)     not null,
  title       varchar(256)    not null,
  content     text            not null,
  send_time   timestamp       not null,
  is_public   boolean         default false,
  is_notify   boolean         default true,
  status      int             not null default 1,
                              -- 1. 草稿
                              -- 2. 等待发布
                              -- 3. 发布成功
                              -- 4. 发布失败
  nread       int             not null default 0,
  nstar       int             not null default 0
);

create table if not exists notifications (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  user_uuid   varchar(36)     not null,
  type        int             not null default 1,
                              -- 1. 通知
                              -- 2. 公告
  title       varchar(256)    not null,
  content     text            not null,
  status      int             not null default 1,
                              -- 1. 未读
                              -- 2. 已读
  refer       varchar(36)
);

create table if not exists ops (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  user_uuid   varchar(36)     not null,
  method      varchar(16)     not null,
  url         varchar(256)    not null,
  body        text            not null,
  audit       varchar(256)    not null
);

create table if not exists oauth (
  provider    varchar(32)     not null unique,
  sortno      int             not null default 1 unique,
  clientid    varchar(128)    not null default '',
  secret      varchar(128)    not null default '',
  enabled     boolean         default false
);

create table if not exists user_oauth (
  uuid        varchar(36)     primary key not null,
  create_at   timestamp       not null default current_timestamp,
  user_uuid   varchar(36)     not null,
  provider    varchar(32)     not null,
  userid      varchar(256)    not null default '',
  email       varchar(128)    not null default '',
  login       varchar(128)    not null default '',
  name        varchar(128)    not null default '',
  avatar      varchar(256)    not null default '',
  profile     text            not null default '',
  status      int             not null default 1,
                              -- 1. 未授权
                              -- 2. 已授权
  usage       int             not null default 1
                              -- 1. 授权
                              -- 2. 登录
);

commit;
