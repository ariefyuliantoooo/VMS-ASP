require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const sql = `
-- 1. HAPUS TABEL LAMA SECARA BERSIH
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.visitors CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. BANGUN ULANG TABEL
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'security' CHECK (role IN ('superadmin', 'admin', 'security')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    purpose TEXT,
    host_name TEXT,
    visit_date DATE DEFAULT CURRENT_DATE,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    qr_code TEXT UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'checked_out', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. AUTO PROFILE LOGIC
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'security'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ENABLE RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- 6. DATA AWAL & ADMIN
INSERT INTO public.tenants (name, slug) VALUES ('Default Company', 'default-company');

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'arief.yuliantoooo@gmail.com') THEN
    INSERT INTO public.profiles (id, email, full_name, role, tenant_id)
    SELECT id, email, 'Arief Admin', 'superadmin', (SELECT id FROM public.tenants LIMIT 1)
    FROM auth.users
    WHERE email = 'arief.yuliantoooo@gmail.com';
  END IF;
END $$;
`;

async function runSeed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('⏳ Menghubungkan ke database...');
    await client.connect();
    console.log('🧹 Membersihkan database lama...');
    console.log('🏗️ Membangun ulang skema baru...');
    await client.query(sql);
    console.log('🚀 DATABASE BERHASIL DIBERSIHKAN & DISIAPKAN!');
    console.log('Sekarang Anda bisa login ke aplikasi.');
  } catch (err) {
    console.error('❌ ERROR KRITIKAL:', err.message);
  } finally {
    await client.end();
  }
}

runSeed();
