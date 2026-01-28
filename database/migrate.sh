#!/bin/bash
set -e

# Database Migration Script using golang-migrate
# This script can run migrations using either:
# 1. golang-migrate CLI (if installed locally)
# 2. golang-migrate Docker image (fallback)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/migrations" && pwd)"
MIGRATIONS_SUPABASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/migrations-supabase" 2>/dev/null && pwd || echo "")"
COMMAND="${1:-up}"
ARGS="${@:-up}"

# Load environment variables from .env if it exists
if [ -f "../backend/.env" ]; then
    echo -e "${GREEN}Loading environment from ../backend/.env${NC}"
    export $(cat ../backend/.env | grep -v '^#' | xargs)
fi

# Build database URL from environment variables or use defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-portfolio_db}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_SSLMODE="${DB_SSLMODE:-disable}"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${DB_SSLMODE}"

AUTH_MODE="${AUTH_MODE:-local}"

echo -e "${YELLOW}Migration Configuration:${NC}"
echo "  Migrations directory: ${MIGRATIONS_DIR}"
echo "  Auth mode: ${AUTH_MODE}"
if [ "${AUTH_MODE}" = "supabase" ] && [ -n "${MIGRATIONS_SUPABASE_DIR}" ]; then
    echo "  Supabase migrations: ${MIGRATIONS_SUPABASE_DIR}"
fi
echo "  Database host: ${DB_HOST}:${DB_PORT}"
echo "  Database name: ${DB_NAME}"
echo "  Database user: ${DB_USER}"
echo "  SSL mode: ${DB_SSLMODE}"
echo ""

# Function to check if golang-migrate is installed
check_migrate_cli() {
    if command -v migrate &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to run migrations using CLI
run_with_cli() {
    echo -e "${GREEN}Using golang-migrate CLI${NC}"
    migrate -path "${MIGRATIONS_DIR}" -database "${DATABASE_URL}" "$@"
}

# Function to run migrations using Docker
run_with_docker() {
    echo -e "${GREEN}Using golang-migrate Docker image${NC}"
    docker run --rm \
        --network host \
        -v "${MIGRATIONS_DIR}:/migrations" \
        migrate/migrate:latest \
        -path=/migrations \
        -database "${DATABASE_URL}" \
        "$@"
}

# Function to display usage
usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  up [N]        Apply all or N up migrations"
    echo "  down [N]      Apply all or N down migrations"
    echo "  drop          Drop everything inside database"
    echo "  force VERSION Set version but don't run migration"
    echo "  version       Print current migration version"
    echo "  create NAME   Create new migration files"
    echo ""
    echo "Examples:"
    echo "  $0 up              # Apply all pending migrations"
    echo "  $0 up 1            # Apply next migration"
    echo "  $0 down 1          # Rollback last migration"
    echo "  $0 version         # Show current version"
    echo "  $0 create add_user_role  # Create new migration"
    echo ""
    echo "Environment variables (or set in ../backend/.env):"
    echo "  DB_HOST        Database host (default: localhost)"
    echo "  DB_PORT        Database port (default: 5432)"
    echo "  DB_NAME        Database name (default: portfolio_db)"
    echo "  DB_USER        Database user (default: postgres)"
    echo "  DB_PASSWORD    Database password (default: postgres)"
    echo "  DB_SSLMODE     SSL mode (default: disable)"
}

# Handle create command separately (doesn't need database connection)
if [ "$COMMAND" = "create" ]; then
    if [ -z "$2" ]; then
        echo -e "${RED}Error: Migration name required${NC}"
        echo "Usage: $0 create <migration_name>"
        exit 1
    fi

    MIGRATION_NAME="$2"

    if check_migrate_cli; then
        migrate create -ext sql -dir "${MIGRATIONS_DIR}" -seq "${MIGRATION_NAME}"
    else
        # Use Docker to create migration
        docker run --rm \
            -v "${MIGRATIONS_DIR}:/migrations" \
            migrate/migrate:latest \
            create -ext sql -dir /migrations -seq "${MIGRATION_NAME}"
    fi
    exit 0
fi

# Handle help command
if [ "$COMMAND" = "help" ] || [ "$COMMAND" = "--help" ] || [ "$COMMAND" = "-h" ]; then
    usage
    exit 0
fi

# Run migrations
echo -e "${YELLOW}Running migration command: ${COMMAND}${NC}"
echo ""

if check_migrate_cli; then
    run_with_cli "$ARGS"
else
    echo -e "${YELLOW}golang-migrate CLI not found. Using Docker...${NC}"
    echo -e "${YELLOW}To install locally: https://github.com/golang-migrate/migrate/tree/master/cmd/migrate#installation${NC}"
    echo ""
    run_with_docker "$ARGS"
fi

echo ""
echo -e "${GREEN}Base migrations completed successfully!${NC}"

# Run Supabase-specific migrations if AUTH_MODE=supabase
if [ "${AUTH_MODE}" = "supabase" ] && [ -n "${MIGRATIONS_SUPABASE_DIR}" ] && [ -d "${MIGRATIONS_SUPABASE_DIR}" ]; then
    echo ""
    echo -e "${YELLOW}Running Supabase-specific migrations...${NC}"

    if check_migrate_cli; then
        migrate -path "${MIGRATIONS_SUPABASE_DIR}" -database "${DATABASE_URL}" "$ARGS"
    else
        docker run --rm \
            --network host \
            -v "${MIGRATIONS_SUPABASE_DIR}:/migrations" \
            migrate/migrate:latest \
            -path=/migrations \
            -database "${DATABASE_URL}" \
            "$ARGS"
    fi

    echo -e "${GREEN}Supabase migrations completed successfully!${NC}"
fi

echo ""
echo -e "${GREEN}All migrations completed successfully!${NC}"
