-- =====================================================
-- MASTER SCHEMA UNTUK VISITOR MANAGEMENT SYSTEM
-- Jalankan kode ini di SQL Editor Supabase Anda
-- =====================================================

-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(255),
    role VARCHAR(255) DEFAULT 'USER',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create visits table
CREATE TABLE IF NOT EXISTS public.visits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    visit_purpose TEXT NOT NULL,
    person_to_meet VARCHAR(255) NOT NULL,
    visit_date DATE NOT NULL,
    qr_code TEXT NOT NULL UNIQUE,
    status VARCHAR(255) DEFAULT 'PENDING',
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create work_permits table
CREATE TABLE IF NOT EXISTS public.work_permits (
    id SERIAL PRIMARY KEY,
    visitor_id INTEGER NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
    worker_name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    job_type VARCHAR(255) NOT NULL,
    work_location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pic_company VARCHAR(255) NOT NULL,
    permit_file TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create auth_logs table
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
