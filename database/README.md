# Database Migrations

This directory contains database schema migrations for Simple Portfolio App using [golang-migrate](https://github.com/golang-migrate/migrate).

## Overview

Database migrations are managed independently of the backend application, making them backend-agnostic and suitable for:
- Local development
- CI/CD pipelines
- Kubernetes deployments
- Manual database management

## Directory Structure

```
database/
├── migrations/           # SQL migration files
│   ├── 000001_create_users_table.up.sql
│   ├── 000001_create_users_table.down.sql
│   ├── 000002_create_portfolios_table.up.sql
│   ├── 000002_create_portfolios_table.down.sql
│   ├── 000003_create_assets_table.up.sql
│   └── 000003_create_assets_table.down.sql
├── migrate.sh           # Migration runner script
└── README.md           # This file
```

## Prerequisites

### Option 1: Using golang-migrate CLI (Recommended for local development)

Install golang-migrate:

**macOS:**
```bash
brew install golang-migrate
```

**Linux:**
```bash
curl -L https://github.com/golang-migrate/migrate/releases/latest/download/migrate.linux-amd64.tar.gz | tar xvz
sudo mv migrate /usr/local/bin/
```

**Windows:**
```bash
scoop install migrate
```

Or download from [releases](https://github.com/golang-migrate/migrate/releases).

### Option 2: Using Docker

No installation needed! The `migrate.sh` script will automatically use Docker if the CLI is not installed.

## Local Development Usage

### Environment Configuration

The migration script reads database configuration from environment variables. You can either:

1. Set environment variables manually:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=portfolio_db
   export DB_USER=postgres
   export DB_PASSWORD=postgres
   export DB_SSLMODE=disable
   ```

2. Or use the `.env` file in `../backend/.env` (automatically loaded by the script)

### Running Migrations

All commands are run from the `database/` directory:

```bash
cd database/
```

**Apply all pending migrations:**
```bash
./migrate.sh up
```

**Apply specific number of migrations:**
```bash
./migrate.sh up 1      # Apply next migration only
./migrate.sh up 2      # Apply next 2 migrations
```

**Rollback migrations:**
```bash
./migrate.sh down 1    # Rollback last migration
./migrate.sh down 2    # Rollback last 2 migrations
```

**Check current migration version:**
```bash
./migrate.sh version
```

**Force set version (use with caution):**
```bash
./migrate.sh force 3   # Set version to 3 without running migrations
```

**Create new migration:**
```bash
./migrate.sh create add_user_role
```

This creates two files:
- `000004_add_user_role.up.sql`
- `000004_add_user_role.down.sql`

**Drop everything (use with extreme caution):**
```bash
./migrate.sh drop
```

### Help
```bash
./migrate.sh help
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Run Database Migrations

on:
  push:
    branches: [main]
    paths:
      - 'database/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run migrations
        run: |
          docker run --rm \
            -v "${{ github.workspace }}/database/migrations:/migrations" \
            migrate/migrate:latest \
            -path=/migrations \
            -database="${{ secrets.DATABASE_URL }}" \
            up
```

### GitLab CI Example

```yaml
migrate:
  stage: deploy
  image: migrate/migrate:latest
  script:
    - migrate -path=database/migrations -database="$DATABASE_URL" up
  only:
    changes:
      - database/migrations/**
```

## Database Schema

### Tables

1. **users**
   - Primary key: `id` (UUID)
   - Unique constraint: `email`
   - Fields: `id`, `email`, `password_hash`, `created_at`

2. **portfolios**
   - Primary key: `id` (auto-increment)
   - Foreign key: `owner_id` → `users.id` (CASCADE DELETE)
   - Fields: `id`, `name`, `owner_id`, `created_at`

3. **assets**
   - Primary key: `id` (auto-increment)
   - Foreign key: `portfolio_id` → `portfolios.id` (CASCADE DELETE)
   - Fields: `id`, `portfolio_id`, `symbol`, `quantity`, `created_at`

## Migration Best Practices

### Writing Migrations

1. **Always use IF EXISTS/IF NOT EXISTS**:
   ```sql
   CREATE TABLE IF NOT EXISTS users (...);
   DROP TABLE IF EXISTS users CASCADE;
   ```

2. **Write both up and down migrations**:
   - `.up.sql`: Apply the change
   - `.down.sql`: Revert the change

3. **Keep migrations small and focused**:
   - One logical change per migration
   - Don't mix schema and data changes

4. **Test migrations locally first**:
   ```bash
   ./migrate.sh up 1    # Apply new migration
   ./migrate.sh down 1  # Test rollback
   ./migrate.sh up 1    # Re-apply
   ```

5. **Never modify existing migrations** once they're deployed to production. Always create new migrations to fix issues.

### Migration Naming Convention

Use descriptive names that explain what the migration does:

```bash
./migrate.sh create add_user_role_column
./migrate.sh create create_audit_log_table
./migrate.sh create add_portfolio_description_index
```

### Handling Data Migrations

For data migrations, create a migration that:
1. Modifies schema in `.up.sql`
2. Migrates data in the same transaction
3. Reverts both schema and data in `.down.sql`

Example:
```sql
-- 000004_add_user_status.up.sql
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
UPDATE users SET status = 'active' WHERE status IS NULL;
ALTER TABLE users ALTER COLUMN status SET NOT NULL;
```

## Troubleshooting

### Migration failed partway through

If a migration fails, golang-migrate marks it as "dirty":

```bash
# Check current version and dirty state
./migrate.sh version

# Option 1: Fix the migration and force version
./migrate.sh force <version_number>

# Option 2: Rollback and fix
./migrate.sh down 1
# Fix the migration file
./migrate.sh up
```

### Database connection refused

Check your connection settings:
```bash
# Test database connection
psql "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
```

Verify environment variables:
```bash
echo $DB_HOST
echo $DB_PORT
echo $DB_NAME
```

### Init container fails in Kubernetes

Check logs:
```bash
kubectl logs -n portfolio-python <pod-name> -c run-migrations
```

Common issues:
- Database not accessible from pod
- Incorrect secret/configmap keys
- Network policies blocking connection
- Database not ready yet (add `initContainers` with wait logic)

### Permission denied on migrate.sh

Make the script executable:
```bash
chmod +x migrate.sh
```

## Migration vs Backend CLI

**Previous approach (backend CLI):**
- Database setup tied to backend application
- Required backend to be deployed to run migrations
- Python/SQLAlchemy specific
- Manual execution needed

**Current approach (golang-migrate):**
- Backend-agnostic (pure SQL)
- Can run independently via CLI, Docker, or K8s
- Version controlled and tracked
- Better for microservices and polyglot systems

## Additional Resources

- [golang-migrate Documentation](https://github.com/golang-migrate/migrate)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Database Migration Patterns](https://martinfowler.com/articles/evodb.html)

## Support

For issues or questions:
1. Check migration logs: `./migrate.sh version`
2. Verify database connectivity
3. Review migration files for syntax errors
