#! /usr/bin/env sh

set -e

# # DEPLOY TO PRODUCTION # #

# # set the environment
export ENVIRONMENT=prod
export GOOGLE_CLOUD_PROJECT=macrocomm-fleet
gcloud config set project macrocomm-fleet

docker compose down

# # build the images
docker compose -f docker-compose.yml build proj_wesbank_backend --no-cache
# docker compose -f docker-compose.yml build proj_wesbank_backend
# # upload image to artifact registry
docker tag mcomm-neuronet-proj_wesbank_backend europe-west1-docker.pkg.dev/macrocomm-fleet/wesbank-new-backend/proj-wesbank-backend:latest
docker push europe-west1-docker.pkg.dev/macrocomm-fleet/wesbank-new-backend/proj-wesbank-backend:latest

# # deploy cloud run revision with latest image
gcloud run deploy proj-wesbank-backend --image europe-west1-docker.pkg.dev/macrocomm-fleet/wesbank-new-backend/proj-wesbank-backend:latest

# # webhook alert
curl -X POST -H "Content-Type: application/json" -d '{"content": "'${USER}' deployed WESBANK FASTAPI to PRODUCTION 🚢"}'  https://discord.com/api/webhooks/1053373665863012442/3BpNCSm-U5UN_YaimcNwkVl0ML7PnKaRbTluMdYmFQ5moSJFq6eaFP7P8q9u3BDJN-b6

echo '🚢'