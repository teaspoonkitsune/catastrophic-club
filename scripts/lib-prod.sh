#!/usr/bin/env bash
set -Eeuo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
app_dir="$(cd -- "${script_dir}/.." && pwd)"
env_file="${ENV_FILE:-"${app_dir}/../env/app.env"}"
compose_file="${COMPOSE_FILE:-"${app_dir}/docker-compose.prod.yml"}"
health_url="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"

compose() {
  docker compose --env-file "${env_file}" -f "${compose_file}" "$@"
}

require_prod_files() {
  if [[ ! -f "${env_file}" ]]; then
    echo "Env file not found: ${env_file}" >&2
    echo "Set ENV_FILE=/path/to/app.env or place it at ../env/app.env." >&2
    exit 1
  fi

  if [[ ! -f "${compose_file}" ]]; then
    echo "Compose file not found: ${compose_file}" >&2
    echo "Set COMPOSE_FILE=/path/to/docker-compose.prod.yml." >&2
    exit 1
  fi
}

print_prod_context() {
  echo "Using env file: ${env_file}"
  echo "Using compose file: ${compose_file}"
  echo "Using health URL: ${health_url}"
}
