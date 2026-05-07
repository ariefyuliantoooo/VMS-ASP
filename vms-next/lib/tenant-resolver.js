import pool from './db';

/**
 * Resolves a tenant's schema based on a slug or domain.
 * @param {string} identifier The slug or domain from the request
 * @returns {Promise<string|null>} The schema name or null if not found
 */
export async function resolveTenantSchema(identifier) {
  try {
    const { rows } = await pool.query(
      'SELECT db_schema FROM tenants WHERE (slug = $1 OR domain = $2) AND status = \'active\'',
      [identifier, identifier]
    );
    
    return rows.length > 0 ? rows[0].db_schema : null;
  } catch (error) {
    console.error('Tenant resolution error:', error);
    return null;
  }
}

/**
 * Resolves tenant from Supabase User metadata
 * Useful when the user is already authenticated
 */
export function getTenantSchemaFromUser(user) {
  return user?.app_metadata?.db_schema || null;
}
