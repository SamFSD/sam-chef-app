#! /usr/bin/env sh


set -e

cd services/kota_shop/frontend/app/

yarn ng build --configuration staging --aot
# sudo cp -R ~/server/fleet_wb/services/kota_shop/frontend/app/dist/* TODO

# firebase deploy