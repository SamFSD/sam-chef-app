#! /usr/bin/env sh
set -e

services/kota-shop/frontend/scripts/start.sh
docker compose logs -f
# docker compose logs -f api

echo '🎂'


