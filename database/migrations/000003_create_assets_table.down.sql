-- Drop assets table and related objects
DROP INDEX IF EXISTS ix_assets_symbol;
DROP INDEX IF EXISTS ix_assets_portfolio_id;
DROP INDEX IF EXISTS ix_assets_id;
DROP TABLE IF EXISTS assets CASCADE;
DROP SEQUENCE IF EXISTS assets_id_seq;
