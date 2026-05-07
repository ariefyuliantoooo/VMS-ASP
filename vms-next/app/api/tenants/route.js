import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const query = `SELECT id, name FROM tenants WHERE is_active = true ORDER BY name ASC`;
    const { rows } = await pool.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify role from app_metadata (set by Supabase Auth)
    const userRole = user.app_metadata?.role;
    if (userRole !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden. Only Superadmin can create tenants.' }, { status: 403 });
    }

    const { name, domain } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Tenant name is required' }, { status: 400 });
    }

    // Insert ke tabel tenants
    const query = `
      INSERT INTO tenants (name, domain, is_active, created_at, updated_at) 
      VALUES ($1, $2, true, NOW(), NOW()) 
      RETURNING *
    `;
    const values = [name, domain || null];

    const { rows } = await pool.query(query, values);

    return NextResponse.json({ message: 'Tenant created successfully', tenant: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating tenant:', error);
    
    // Tangani error duplicate name
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Tenant name already exists' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
