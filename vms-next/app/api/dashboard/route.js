import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterTenantId = searchParams.get('tenantId');
    const role = searchParams.get('role') || 'admin';
    const userTenantId = parseInt(searchParams.get('userTenantId')) || 1;

    // Simulasi session dari request
    const user = {
      role: role,
      tenant_id: userTenantId, 
    };

    // Query khusus untuk PostgreSQL (Supabase)
    let visitorsQuery = `
      SELECT v.id, v.full_name as name, v.visit_purpose as purpose, v.status, v.created_at, t.name as tenant_name 
      FROM visits v
      JOIN tenants t ON v.tenant_id = t.id
    `;
    let queryParams = [];

    // Logic Isolasi Multi-Tenant
    if (user.role === 'superadmin') {
      if (filterTenantId && filterTenantId !== 'ALL') {
        visitorsQuery += ` WHERE v.tenant_id = $1`;
        queryParams.push(filterTenantId);
      }
    } else if (user.role === 'admin') {
      // Admin hanya bisa melihat tenant-nya sendiri
      visitorsQuery += ` WHERE v.tenant_id = $1`;
      queryParams.push(user.tenant_id);
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    visitorsQuery += ` ORDER BY v.created_at DESC LIMIT 10`;

    // Ambil data pengunjung
    const { rows: visitors } = await pool.query(visitorsQuery, queryParams);

    // Ambil data tenants (khusus untuk superadmin switcher)
    let tenants = [];
    if (user.role === 'superadmin') {
      const { rows } = await pool.query(`SELECT id, name FROM tenants ORDER BY name ASC`);
      tenants = rows;
    }

    // Hitung statistik
    const stats = {
      totalToday: visitors.length,
      checkedIn: visitors.filter(v => v.status === 'CHECKED_IN').length,
      checkedOut: visitors.filter(v => v.status === 'DONE').length,
      pending: visitors.filter(v => v.status === 'PENDING').length,
    };

    return NextResponse.json({ visitors, stats, tenants });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
