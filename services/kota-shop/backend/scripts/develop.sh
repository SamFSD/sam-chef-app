#! /usr/bin/env sh
set -e

## START SCRIPT FOR DEVELOPMENT ##
# always start the development environment with this script

export ENVIRONMENT=dev

services/kota-shop/backend/scripts/start.sh

# services/proj_wesbank/backend/scripts/db-up.sh

# follow all the logs are a specific service's logs
# docker compose logs -f
# docker compose logs -f api

echo '🎂'
