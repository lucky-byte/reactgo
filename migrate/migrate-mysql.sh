#!/bin/sh

dbname=reactgo

# Database connection url to migrate, see:
# https://github.com/golang-migrate/migrate/tree/master/database/mysql
#
CONNECTION_URL="mysql://root@tcp(localhost)/${dbname}"

migrate -database "$CONNECTION_URL" -path . $@
