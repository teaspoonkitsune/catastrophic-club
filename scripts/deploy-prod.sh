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
attempt=1
max_attempts=30

until curl -fsS "${health_url}"; do
  if [[ "${attempt}" -ge "${max_attempts}" ]]; then
    echo
    echo "Health check failed after ${max_attempts} attempts." >&2
    exit 1
  fi

  echo
  echo "Health check attempt ${attempt}/${max_attempts} failed. Waiting 2s..."
  attempt=$((attempt + 1))
  sleep 2
done
echo
echo "Deploy complete."
