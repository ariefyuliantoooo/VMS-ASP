import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createAdminClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const { userId, email, fullName, phone, company, isNewTenant, newTenantName, tenantId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let finalTenantId = tenantId;
    let finalRole = 'admin'; // Default role for registering users

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Handle New Tenant Creation
      if (isNewTenant && newTenantName) {
        const tenantRes = await client.query(
          'INSERT INTO tenants (name, domain, is_active, created_at, updated_at) VALUES ($1, $2, true, NOW(), NOW()) RETURNING id',
          [newTenantName, newTenantName.toLowerCase().replace(/\s+/g, '-')]
        );
        finalTenantId = tenantRes.rows[0].id;
        finalRole = 'admin'; // If they create a tenant, they are the admin
      } else if (!finalTenantId) {
        // Fallback to default tenant if none specified (though UI should prevent this)
        const defaultTenantRes = await client.query('SELECT id FROM tenants LIMIT 1');
        finalTenantId = defaultTenantRes.rows[0]?.id;
        finalRole = 'staff'; // Joining an existing tenant as staff
      }

      // 2. Create/Update User in the DB (profiles or users table)
      // We check if 'profiles' or 'users' table exists. Based on run_seed.js it's 'profiles'.
      // Based on migrate_multitenant.js it's 'users'. We'll try 'users' first as it's the more common name in this project.
      try {
        await client.query(
          `INSERT INTO users (id, email, full_name, role, tenant_id, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET 
           full_name = EXCLUDED.full_name, 
           role = EXCLUDED.role, 
           tenant_id = EXCLUDED.tenant_id,
           updated_at = NOW()`,
          [userId, email, fullName, finalRole.toUpperCase(), finalTenantId]
        );
      } catch (err) {
        // Fallback to 'profiles' table if 'users' doesn't exist
        console.log('Users table failed, trying profiles table...');
        await client.query(
          `INSERT INTO profiles (id, email, full_name, role, tenant_id, created_at) 
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (id) DO UPDATE SET 
           full_name = EXCLUDED.full_name, 
           role = EXCLUDED.role, 
           tenant_id = EXCLUDED.tenant_id`,
          [userId, email, fullName, finalRole.toLowerCase(), finalTenantId]
        );
      }

      // 3. Update Supabase app_metadata via Admin Client
      const supabaseAdmin = createAdminClient();
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { 
          app_metadata: { 
            tenant_id: finalTenantId, 
            role: finalRole.toLowerCase() 
          } 
        }
      );

      if (updateError) throw updateError;

      await client.query('COMMIT');
      
      return NextResponse.json({ 
        message: 'Registration completed successfully', 
        tenantId: finalTenantId,
        role: finalRole
      }, { status: 200 });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
