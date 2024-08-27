#! /usr/bin/env sh

set -e

# docker compose up web
docker compose up kota_shop_frontend -d
# docker compose up kota_shop_frontend --build -d


