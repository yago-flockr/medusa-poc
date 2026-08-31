#!/usr/bin/env bash
# Wipes the local Postgres database and reseeds it from zero. Destructive —
# asks for confirmation unless run with -y/--yes. Requires the postgres
# container (docker-compose.yml) already running.
set -euo pipefail

# Must match docker-compose.yml's postgres service.
POSTGRES_CONTAINER="medusa-poc-postgres"
POSTGRES_USER="medusa"
POSTGRES_DB="medusa_poc"

SKIP_CONFIRM=false
for arg in "$@"; do
  [[ "$arg" == "-y" || "$arg" == "--yes" ]] && SKIP_CONFIRM=true
done

confirm() {
  $SKIP_CONFIRM && return
  read -r -p "This permanently deletes all data in the local '$POSTGRES_DB' database. Continue? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }
}

resetSchema() {
  echo "Dropping and recreating the 'public' schema..."
  docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
}

migrateAndSeed() {
  echo "Running migrations..."
  pnpm --filter @dtc/backend exec medusa db:migrate
  echo "Seeding..."
  pnpm --filter @dtc/backend run seed
}

syncPublishableKey() {
  # Seeding above generates a brand-new publishable API key every time, so
  # the storefront's .env.local must be re-synced or it's left pointing at a
  # key that no longer exists. Only applies if the storefront is configured.
  if [ ! -f "apps/storefront/.env.local" ]; then
    echo "Skipping publishable key sync: apps/storefront/.env.local not found."
    return
  fi
  echo "Syncing publishable API key to storefront .env.local..."
  pnpm --filter @dtc/backend exec medusa exec ./seeds/sync-publishable-key.ts
}

main() {
  confirm
  resetSchema
  migrateAndSeed
  syncPublishableKey
  echo "Database reset and reseeded."
}

main
