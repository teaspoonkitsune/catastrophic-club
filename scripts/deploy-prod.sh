#!/usr/bin/env bash
set -Eeuo pipefail

source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib-prod.sh"

require_prod_files

cd "${app_dir}"

print_prod_context

echo "Pulling latest code..."
git pull --ff-only

echo "Building production images..."
compose build app migrate

echo "Starting PostgreSQL and Keycloak..."
compose up -d postgres keycloak

echo "Running database migrations..."
compose --profile tools run --rm migrate

echo "Starting application..."
compose up -d app

echo "Checking health endpoint..."
curl -f "${health_url}"
echo
echo "Deploy complete."
