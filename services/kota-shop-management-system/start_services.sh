#! /usr/bin/env sh
set -e

services/kota-shop-management-system/backend/scripts/start.sh
services/kota-shop-management-system/frontend/scripts/start.sh
docker compose logs -f

echo '🎂'


