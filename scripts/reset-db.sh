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

main() {
  confirm
  resetSchema
  migrateAndSeed
  echo "Database reset and reseeded."
}

main
