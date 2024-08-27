#! /usr/bin/env sh

set -e

cd services/kota_shop/frontend/app/

yarn ng build --configuration production --aot
