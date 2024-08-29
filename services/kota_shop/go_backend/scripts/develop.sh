#! /usr/bin/env sh

set -e

# docker compose up web
docker compose up kota_shop_backend -d
# docker compose up kota_shop_backend --build -d


