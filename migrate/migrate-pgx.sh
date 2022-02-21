#!/bin/sh

# 数据库名
#
dbname=reactgo

# Database connection url to migrate, see:
# https://github.com/golang-migrate/migrate/tree/master/database/mysql
#
CONNECTION_URL="postgres://localhost/${dbname}?sslmode=disable"

migrate -database "$CONNECTION_URL" -path . $@
