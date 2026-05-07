import pool from './db';

/**
 * Executes a callback within the context of a tenant's PostgreSQL schema.
 * @param {string} schemaName The schema name (e.g. 'tenant_astra')
 * @param {(client) => Promise<any>} callback The function to execute with the tenant-scoped client
 */
export async function withTenant(schemaName, callback) {
  const client = await pool.connect();
  try {
    // Sanitize schema name (allow alphanumeric, underscore, and hyphen)
    const sanitizedSchema = schemaName.replace(/[^a-z0-9_-]/gi, '');
    
    // Set the search path to the tenant's schema
    await client.query(`SET search_path TO "${sanitizedSchema}", public`);
    
    // Execute the user's logic
    return await callback(client);
  } finally {
    // Release the client back to the pool
    // Note: The pool handles resetting the connection state (like search_path) 
    // when the client is checked out again, but being explicit is safer in some environments.
    await client.query('SET search_path TO public');
    client.release();
  }
}

/**
 * Example usage:
 * 
 * const visitors = await withTenant('tenant_astra', async (client) => {
 *   const { rows } = await client.query('SELECT * FROM visitors');
 *   return rows;
 * });
 */
