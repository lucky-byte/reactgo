begin;

drop table if exists serials;
drop table if exists debug;
drop table if exists image_store;
drop table if exists users;
drop table if exists signin_history;
drop table if exists acl;
drop table if exists acl_allows;
drop table if exists mtas;
drop table if exists smss;
drop table if exists account;
drop table if exists events;
drop table if exists tasks;
drop table if exists images;
drop table if exists geoip;
drop table if exists tree;
drop table if exists tree_bind;
drop table if exists tickets;
drop table if exists bulletins;
drop table if exists notifications;
drop table if exists ops;
drop table if exists oauth;
drop table if exists user_oauth;

commit;
