-- Create sequence for portfolios
CREATE SEQUENCE IF NOT EXISTS portfolios_id_seq;

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id INTEGER NOT NULL DEFAULT nextval('portfolios_id_seq'::regclass) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT portfolios_owner_id_fkey FOREIGN KEY (owner_id)
        REFERENCES users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_portfolios_id
    ON portfolios USING btree (id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True);

CREATE INDEX IF NOT EXISTS ix_portfolios_owner_id
    ON portfolios USING btree (owner_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True);
