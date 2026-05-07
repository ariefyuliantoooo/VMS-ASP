-- SEED TENANT
-- Run this after 01_init_public.sql
INSERT INTO tenants (name, slug, db_schema, status)
VALUES ('Astra International', 'astra', 'tenant_astra', 'active')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tenants (name, slug, db_schema, status)
VALUES ('PLN Persero', 'pln', 'tenant_pln', 'active')
ON CONFLICT (slug) DO NOTHING;
