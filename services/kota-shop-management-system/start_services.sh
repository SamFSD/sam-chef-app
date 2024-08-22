#! /usr/bin/env sh
set -e

services/kota-shop-management-system/frontend/scripts/start.sh
docker compose logs -f
# docker compose logs -f api

echo '🎂'


