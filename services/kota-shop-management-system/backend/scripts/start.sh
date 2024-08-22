#! /usr/bin/env sh

set -e
# docker compose up 
docker compose up json-server -d
docker compose up kota-shop_backend -d
# docker compose up json-server -d



