#!/usr/bin/env bash
set -Eeuo pipefail

source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib-prod.sh"

require_prod_files

if [[ "$#" -eq 0 ]]; then
  set -- app keycloak postgres
fi

compose logs --tail 200 -f "$@"
