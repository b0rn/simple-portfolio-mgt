-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email
    ON users USING btree (email ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True);
