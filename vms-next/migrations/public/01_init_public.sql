-- PUBLIC SCHEMA MIGRATION
-- Holds metadata for all tenants

CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT UNIQUE,
    db_schema TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure db_schema column exists for migration from older versions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' AND column_name='db_schema') THEN
        ALTER TABLE tenants ADD COLUMN db_schema TEXT;
    END IF;
END $$;

-- Fix null db_schema for existing tenants
UPDATE tenants SET db_schema = 'tenant_' || slug WHERE db_schema IS NULL;

-- Global user table for authentication across tenants
-- Links to auth.users in Supabase
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- References auth.users.id
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'security', 'staff')),
    last_tenant_id INTEGER REFERENCES tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
