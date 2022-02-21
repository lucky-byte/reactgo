#!/bin/sh

dbname=reactgo

# MySQL 命令行选项, see mysql --help
#
OPTIONS='-u root'

# 创建数据库
#
mysql $OPTIONS -e "create database if not exists ${dbname}"

# Database connection url to migrate, see:
# https://github.com/golang-migrate/migrate/tree/master/database/mysql
#
CONNECTION_URL="mysql://root@tcp(localhost)/${dbname}"

migrate -database "$CONNECTION_URL" -path . $@
