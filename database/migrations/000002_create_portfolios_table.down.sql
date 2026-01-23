-- Drop portfolios table and related objects
DROP INDEX IF EXISTS ix_portfolios_owner_id;
DROP INDEX IF EXISTS ix_portfolios_id;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP SEQUENCE IF EXISTS portfolios_id_seq;
