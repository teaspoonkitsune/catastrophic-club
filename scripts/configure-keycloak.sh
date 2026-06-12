#!/usr/bin/env bash
set -Eeuo pipefail

source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib-bootstrap.sh"

mode="local"
env_file=""
app_origin=""
keycloak_server_url="http://127.0.0.1:8080"

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --local)
      mode="local"
      shift
      ;;
    --prod)
      mode="prod"
      shift
      ;;
    --env-file)
      env_file="$2"
      shift 2
      ;;
    --app-origin)
      app_origin="$2"
      shift 2
      ;;
    --keycloak-server-url)
      keycloak_server_url="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ "${mode}" == "local" ]]; then
  env_file="${env_file:-"${app_dir}/.env"}"
  compose_cmd=(docker compose -f "${app_dir}/docker-compose.local.yml")
  app_origin="${app_origin:-http://localhost:3000}"
else
  env_file="${env_file:-"${app_dir}/../env/app.env"}"
  compose_cmd=(docker compose --env-file "${env_file}" -f "${app_dir}/docker-compose.prod.yml")
fi

if [[ ! -f "${env_file}" ]]; then
  echo "Env file not found: ${env_file}" >&2
  exit 1
fi

set -a
source "${env_file}"
set +a

if [[ "${mode}" == "prod" && -z "${app_origin}" ]]; then
  if [[ -z "${APP_DOMAIN:-}" ]]; then
    echo "APP_DOMAIN is required in production mode." >&2
    exit 1
  fi

  app_origin="https://${APP_DOMAIN}"
fi

if [[ -z "${KEYCLOAK_REALM:-}" || -z "${KEYCLOAK_CLIENT_ID:-}" || -z "${KEYCLOAK_CLIENT_SECRET:-}" ]]; then
  echo "Missing KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, or KEYCLOAK_CLIENT_SECRET in ${env_file}" >&2
  exit 1
fi

if [[ -z "${KEYCLOAK_ADMIN_USERNAME:-}" || -z "${KEYCLOAK_ADMIN_PASSWORD:-}" ]]; then
  echo "Missing KEYCLOAK_ADMIN_USERNAME or KEYCLOAK_ADMIN_PASSWORD in ${env_file}" >&2
  exit 1
fi

echo "Configuring Keycloak client '${KEYCLOAK_CLIENT_ID}' for realm '${KEYCLOAK_REALM}'"
echo "App origin: ${app_origin}"
echo "Env file: ${env_file}"

"${compose_cmd[@]}" exec -T keycloak /bin/sh -lc "
set -eu
/opt/keycloak/bin/kcadm.sh config credentials \
  --server '${keycloak_server_url}' \
  --realm master \
  --user '${KEYCLOAK_ADMIN_USERNAME}' \
  --password '${KEYCLOAK_ADMIN_PASSWORD}' >/tmp/kcadm-login.log

if [ '${mode}' = 'local' ]; then
  /opt/keycloak/bin/kcadm.sh update realms/master -s sslRequired=NONE >/tmp/kcadm-master-update.log
fi

client_id=\$(/opt/keycloak/bin/kcadm.sh get clients -r '${KEYCLOAK_REALM}' -q clientId='${KEYCLOAK_CLIENT_ID}' --fields id --format csv --noquotes | tail -n 1)

if [ -z \"\${client_id}\" ]; then
  /opt/keycloak/bin/kcadm.sh create clients -r '${KEYCLOAK_REALM}' \
    -s clientId='${KEYCLOAK_CLIENT_ID}' \
    -s name='CATastrophic club web' \
    -s enabled=true \
    -s protocol='openid-connect' \
    -s publicClient=false \
    -s standardFlowEnabled=false \
    -s directAccessGrantsEnabled=true \
    -s serviceAccountsEnabled=false \
    -s implicitFlowEnabled=false \
    -s rootUrl='${app_origin}' \
    -s baseUrl='${app_origin}' \
    -s webOrigins='[\"${app_origin}\"]' \
    -s secret='${KEYCLOAK_CLIENT_SECRET}' >/tmp/kcadm-client-create.log

  client_id=\$(/opt/keycloak/bin/kcadm.sh get clients -r '${KEYCLOAK_REALM}' -q clientId='${KEYCLOAK_CLIENT_ID}' --fields id --format csv --noquotes | tail -n 1)
fi

/opt/keycloak/bin/kcadm.sh update clients/\${client_id} -r '${KEYCLOAK_REALM}' \
  -s name='CATastrophic club web' \
  -s enabled=true \
  -s protocol='openid-connect' \
  -s publicClient=false \
  -s standardFlowEnabled=false \
  -s directAccessGrantsEnabled=true \
  -s serviceAccountsEnabled=false \
  -s implicitFlowEnabled=false \
  -s rootUrl='${app_origin}' \
  -s baseUrl='${app_origin}' \
  -s webOrigins='[\"${app_origin}\"]' \
  -s secret='${KEYCLOAK_CLIENT_SECRET}' >/tmp/kcadm-client-update.log
"

echo "Keycloak client configuration updated."
