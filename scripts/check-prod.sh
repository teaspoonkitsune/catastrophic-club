#!/usr/bin/env bash
set -Eeuo pipefail

source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib-prod.sh"

require_prod_files
print_prod_context

echo "Container status:"
compose ps

echo
echo "Health response:"
curl -fsS "${health_url}"
echo
