#! /usr/bin/env sh


set -e

cd services/proj_wesbank/frontend/app/

yarn ng build --configuration staging --aot
sudo cp -R ~/server/fleet_wb/services/proj_wesbank/frontend/app/dist/* /var/www/wesbank-dev/
# firebase use wesbank-fe-2
# firebase deploy