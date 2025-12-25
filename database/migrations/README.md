# Database Migrations

This directory contains SQL migration files for the DouDou database.

## Migration Files

### 001_add_agent_tables.sql
Creates tables for the ReAct Agent system:
- `agent_conversations` - Stores conversation turns with execution details
- `agent_sessions` - Manages session state and context

**Indexes created:**
- `idx_agent_conversations_session_id` - Fast session lookups
- `idx_agent_conversations_created_at` - Time-based queries
- `idx_agent_conversations_session_time` - Composite index for session history
- `idx_agent_sessions_last_active` - Session expiration cleanup

**Rollback:** Use `001_add_agent_tables_rollback.sql` to remove these tables.

## Running Migrations

Migrations are automatically run when you execute:

```bash
npm run db:setup
```

This command will:
1. Create the database and user (if needed)
2. Create all base tables
3. Run all migrations in order
4. Verify table creation

## Manual Migration

To run a specific migration manually:

```bash
psql -d doudou_db -U doudou_user -f database/migrations/001_add_agent_tables.sql
```

## Rollback

To rollback a migration:

```bash
psql -d doudou_db -U doudou_user -f database/migrations/001_add_agent_tables_rollback.sql
```

## Adding New Migrations

1. Create a new SQL file with format: `XXX_description.sql`
2. Create a corresponding rollback file: `XXX_description_rollback.sql`
3. Add the migration to `scripts/database/setup-database.ts`
4. Test the migration on a development database
5. Document the migration in this README

## Migration Best Practices

- Always use `IF NOT EXISTS` for table creation
- Always use `IF EXISTS` for table deletion
- Create indexes after table creation
- Add comments to document table purposes
- Test migrations on a copy of production data before deploying
- Keep migrations idempotent (can be run multiple times safely)
