-- STEP 3: SETUP MULTI-TENANT RLS (PRODUCTION GRADE)
-- Execute this in the Supabase SQL Editor

-- 1. Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- 2. Helper Functions to extract JWT metadata
-- We assume tenant_id and role are stored in auth.users app_metadata
-- Note: In Next.js with Supabase Auth, you set these via service_role client on user creation
CREATE OR REPLACE FUNCTION auth.jwt_tenant_id() RETURNS integer AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', '')::integer;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth.jwt_role() RETURNS text AS $$
  SELECT current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role';
$$ LANGUAGE sql STABLE;

-- 3. POLICIES FOR 'tenants'
-- Superadmin can do everything
CREATE POLICY "Superadmin manage all tenants" ON tenants
  FOR ALL TO authenticated
  USING (auth.jwt_role() = 'superadmin')
  WITH CHECK (auth.jwt_role() = 'superadmin');

-- Users can only view their own tenant
CREATE POLICY "Users view own tenant" ON tenants
  FOR SELECT TO authenticated
  USING (id = auth.jwt_tenant_id());

-- 4. POLICIES FOR 'users'
-- Superadmin can do everything
CREATE POLICY "Superadmin manage all users" ON users
  FOR ALL TO authenticated
  USING (auth.jwt_role() = 'superadmin')
  WITH CHECK (auth.jwt_role() = 'superadmin');

-- Admins can manage users in their tenant
CREATE POLICY "Admins manage tenant users" ON users
  FOR ALL TO authenticated
  USING (tenant_id = auth.jwt_tenant_id())
  WITH CHECK (tenant_id = auth.jwt_tenant_id());

-- 5. POLICIES FOR 'visits'
-- Superadmin can do everything
CREATE POLICY "Superadmin manage all visits" ON visits
  FOR ALL TO authenticated
  USING (auth.jwt_role() = 'superadmin')
  WITH CHECK (auth.jwt_role() = 'superadmin');

-- Admins and Security can manage visits in their tenant
CREATE POLICY "Tenant staff manage visits" ON visits
  FOR ALL TO authenticated
  USING (tenant_id = auth.jwt_tenant_id())
  WITH CHECK (tenant_id = auth.jwt_tenant_id());

-- 6. POLICIES FOR 'auth_logs'
CREATE POLICY "Superadmin view all logs" ON auth_logs
  FOR ALL TO authenticated
  USING (auth.jwt_role() = 'superadmin');

CREATE POLICY "Admins view tenant logs" ON auth_logs
  FOR SELECT TO authenticated
  USING (tenant_id = auth.jwt_tenant_id());

-- 7. Add Indexes for optimization (Step 5)
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visits_tenant_id ON visits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_logs_tenant_id ON auth_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_qr_code ON visits(qr_code);
