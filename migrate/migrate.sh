#!/bin/sh

dbname=reactgo

CONNECTION_URL="postgres://localhost/${dbname}?sslmode=disable"
migrate -database "$CONNECTION_URL" -path . $@
