#! /usr/bin/env sh
set -e

## START THE CONTAINERS ##
# make sure docker is running
# be sure to set the ENVIROMENT variable, else default is dev

# export GOOGLE_CLOUD_PROJECT=$(gcloud config get-value project)
export GOOGLE_CLOUD_PROJECT="macrocomm"
export POSTGRES_DB=_db

# docker compose down

# docker compose up db-local -d
docker compose up proj_wesbank_backend -d 
# docker compose up proj_wesbank_backend -d --build

echo '🍩'
