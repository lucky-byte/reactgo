#!/bin/sh

echo "hello world"

echo $DSN

trap 'echo "SIG TERM received"' TERM
trap 'echo "SIG INT received"' INT

sleep 60

exit 1
