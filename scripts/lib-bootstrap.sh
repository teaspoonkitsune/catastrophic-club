#!/usr/bin/env bash
set -Eeuo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
app_dir="$(cd -- "${script_dir}/.." && pwd)"

generate_urlsafe_secret() {
  head -c 48 /dev/urandom | base64 | tr -d '\n=' | tr '+/' '-_'
}

generate_password() {
  head -c 36 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 32
}

require_file_absent_or_force() {
  local target="$1"
  local force="${2:-false}"

  if [[ -e "${target}" && "${force}" != "true" ]]; then
    echo "Refusing to overwrite existing file: ${target}" >&2
    echo "Re-run with --force if you want the script to rewrite it." >&2
    exit 1
  fi
}

wait_for_http() {
  local url="$1"
  local attempts="${2:-60}"
  local sleep_seconds="${3:-2}"

  for ((attempt = 1; attempt <= attempts; attempt += 1)); do
    if curl -fsS "${url}" >/dev/null 2>&1; then
      return 0
    fi

    sleep "${sleep_seconds}"
  done

  echo "Timed out waiting for ${url}" >&2
  return 1
}
