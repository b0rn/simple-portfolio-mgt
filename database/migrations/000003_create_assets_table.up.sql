-- Create sequence for assets
CREATE SEQUENCE IF NOT EXISTS assets_id_seq;

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER NOT NULL DEFAULT nextval('assets_id_seq'::regclass) PRIMARY KEY,
    portfolio_id INTEGER NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT assets_portfolio_id_fkey FOREIGN KEY (portfolio_id)
        REFERENCES portfolios (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_assets_id
    ON assets USING btree (id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True);

CREATE INDEX IF NOT EXISTS ix_assets_portfolio_id
    ON assets USING btree (portfolio_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True);

CREATE INDEX IF NOT EXISTS ix_assets_symbol
    ON assets USING btree (symbol ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True);
