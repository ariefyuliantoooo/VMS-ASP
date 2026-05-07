import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterTenantId = searchParams.get('tenantId');
    const role = searchParams.get('role') || 'admin';
    const userTenantId = parseInt(searchParams.get('userTenantId')) || 1;

    let visitorsQuery = `
      SELECT v.id, v.full_name as name, v.phone, v.visit_purpose as purpose, v.status, v.created_at, t.name as tenant_name 
      FROM visits v
      JOIN tenants t ON v.tenant_id = t.id
    `;
    let queryParams = [];

    // Logic Isolasi Multi-Tenant
    if (role === 'superadmin') {
      if (filterTenantId && filterTenantId !== 'ALL') {
        visitorsQuery += ` WHERE v.tenant_id = $1`;
        queryParams.push(filterTenantId);
      }
    } else if (role === 'admin') {
      visitorsQuery += ` WHERE v.tenant_id = $1`;
      queryParams.push(userTenantId);
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    visitorsQuery += ` ORDER BY v.created_at DESC`;

    const { rows: visitors } = await pool.query(visitorsQuery, queryParams);

    return NextResponse.json({ visitors });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
