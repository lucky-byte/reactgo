#!/bin/sh

dbpath="/tmp/reactgo.db"

# Database connection url to migrate, see:
# https://github.com/golang-migrate/migrate/tree/master/database/sqlite
#
CONNECTION_URL="sqlite://${dbpath}?x-no-tx-wrap=true"

migrate -database "$CONNECTION_URL" -path . $@
