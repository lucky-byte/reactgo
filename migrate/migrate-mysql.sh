#!/bin/sh

dbname=reactgo

# Database connection options to mysql, see mysql --help
#
OPTIONS='-u root'

# Database connection url to migrate, see:
# https://github.com/golang-migrate/migrate/tree/master/database/mysql
#
CONNECTION_URL="mysql://root@tcp(localhost)/${dbname}"

mysql $OPTIONS -e "create schema if not exists ${dbname}"

migrate -database "$CONNECTION_URL" -path . $@
