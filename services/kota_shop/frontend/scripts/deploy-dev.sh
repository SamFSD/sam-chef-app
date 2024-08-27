#! /usr/bin/env sh

set -e

# Navigate to the frontend application directory
cd services/kota_shop/frontend/app/

# Check if the .angular directory exists and delete it if it does
if [ -d ".angular" ]; then
  rm -rf .angular
fi

# Proceed with the build
yarn ng build build --watch --configuration development
