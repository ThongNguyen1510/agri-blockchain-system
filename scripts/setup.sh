#!/usr/bin/env bash
set -euo pipefail

run_step() {
  local title="$1"
  shift
  echo "==> ${title}"
  "$@"
  echo "✔  ${title}"
}

install_npm() {
  local path="$1"
  if [ -f "${path}/package-lock.json" ]; then
    run_step "Installing node modules in ${path}" bash -lc "cd ${path} && npm ci"
  else
    run_step "Installing node modules in ${path}" bash -lc "cd ${path} && npm install"
  fi
}

install_npm "apps/frontend"
install_npm "apps/backend"
install_npm "apps/contracts"

if [[ "${1:-}" != "--skip-prisma" ]]; then
  run_step "Generating Prisma Client" bash -lc "cd apps/backend && npx prisma generate"
else
  echo "⚠️  Skip Prisma client generation (--skip-prisma)."
fi

echo "All dependencies installed."