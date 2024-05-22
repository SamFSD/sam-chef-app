#! /usr/bin/env sh
set -e

## START SCRIPT FOR DEVELOPMENT ##
# always start the development environment with this script
services/proj_wesbank/backend/scripts/develop.sh
services/proj_wesbank/frontend/scripts/start.sh
# follow all the logs are a specific service's logs
docker compose logs -f
# docker compose logs -f api

echo '🎂'


