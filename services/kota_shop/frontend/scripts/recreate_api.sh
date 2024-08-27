#!/usr/bin/env sh

set -e

# Determine the environment (default to development if not set)
ENVIRONMENT="${ENVIRONMENT:-development}"


# Set options based on the environment
case "$ENVIRONMENT" in
  development)
    API_URL="http://localhost:8000/openapi.json"
       docker compose down kota_shop_frontend
       sudo rm -rf services/kota_shop/frontend/app/src/app/core/api/api_service
       mkdir -p services/kota_shop/frontend/app/src/app/core/api/api_service
       curl -o services/kota_shop/frontend/app/src/app/core/api/openapi.json "$API_URL"
       docker compose down kota_shop_backend
       docker run --rm \
       -v "${PWD}/services/kota_shop/frontend/:/services/kota_shop/frontend/" openapitools/openapi-generator-cli generate \
       -i /services/kota_shop/frontend/app/src/app/core/api/openapi.json \
       -g typescript-angular \
       -o /services/kota_shop/frontend/app/src/app/core/api/api_service \
       --skip-validate-spec
       sh services/kota_shop/start_services.sh
    ;;
  staging)
    API_URL="https://wbapi-dev.fleet-analytics.co.za/openapi.json"
       sudo rm -rf services/kota_shop/frontend/app/src/app/core/api/api_service
       mkdir -p services/kota_shop/frontend/app/src/app/core/api/api_service
       curl -o services/kota_shop/frontend/app/src/app/core/api/openapi.json "$API_URL"
       docker run --rm \
       -v "${PWD}/services/kota_shop/frontend/:/services/kota_shop/frontend/" openapitools/openapi-generator-cli generate \
       -i /services/kota_shop/frontend/app/src/app/core/api/openapi.json \
       -g typescript-angular \
       -o /services/kota_shop/frontend/app/src/app/core/api/api_service \
       --skip-validate-spec
    ;;
  production)
    API_URL="https://wbapi.fleet-analytics.co.za/openapi.json"
       sudo rm -rf services/kota_shop/frontend/app/src/app/core/api/api_service
       mkdir -p services/kota_shop/frontend/app/src/app/core/api/api_service
       curl -o services/kota_shop/frontend/app/src/app/core/api/openapi.json "$API_URL"
       docker run --rm \
       -v "${PWD}/services/kota_shop/frontend/:/services/kota_shop/frontend/" openapitools/openapi-generator-cli generate \
       -i /services/kota_shop/frontend/app/src/app/core/api/openapi.json \
       -g typescript-angular \
       -o /services/kota_shop/frontend/app/src/app/core/api/api_service \
       --skip-validate-spec
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

