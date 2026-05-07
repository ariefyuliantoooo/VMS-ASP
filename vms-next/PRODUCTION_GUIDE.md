# Production Deployment Guide - VMS SaaS

This guide outlines the steps to deploy the Multi-Tenant Visitor Management System (VMS) to production using Vercel and Supabase.

## 1. Supabase Setup

### Database Schema & RLS
1. Open your Supabase Project Dashboard.
2. Go to the **SQL Editor**.
3. Create a new query and paste the contents of `supabase_setup.sql`.
4. Run the query to enable RLS, create helper functions, and add indexes.

### Authentication Configuration
1. Go to **Authentication > Providers > Email**.
2. Ensure "Confirm email" is configured according to your needs (disable for easier testing, enable for production).
3. Set the **Site URL** in **Authentication > URL Configuration** to your Vercel deployment URL (e.g., `https://your-app.vercel.app`).
4. Add `http://localhost:3000/**` to **Redirect URLs** for local development.

## 2. Environment Variables

Set the following variables in Vercel (and `.env.local` for local production testing):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string with `sslmode=require`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon/Public Key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key (Keep Private). |
| `JWT_SECRET` | Same JWT Secret as configured in Supabase. |
| `NEXT_PUBLIC_APP_URL` | Your production URL (e.g., `https://vms-saas.vercel.app`). |

## 3. Vercel Deployment

1. Connect your repository to Vercel.
2. Configure the **Build Command**: `npm run build`.
3. Configure the **Output Directory**: `.next`.
4. Add the Environment Variables listed above.
5. Deploy!

## 4. Multi-Tenant Administration

### Creating a Superadmin
To create the initial superadmin, you can use the `vms-next/create_admin.js` script (after setting up `.env.local`) or manually insert a user into `auth.users` and add the following to `app_metadata`:
```json
{
  "role": "superadmin"
}
```

### Creating Tenants
Use the **Tenants** module in the Dashboard (Superadmin access required) to create new tenant organizations. When a tenant is created, its `tenant_id` must be assigned to its respective Admin users.

## 5. Security Best Practices

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- Always use `lib/supabase-server.js` for sensitive operations.
- Regularly audit RLS policies to ensure tenant isolation.
- Use `sslmode=require` for all database connections.

## 6. Scaling Recommendations

- **Database**: Use Supabase's built-in connection pooler (`pgbouncer`) for high-concurrency scenarios.
- **Caching**: Implement Next.js `revalidate` for reports and static data.
- **Monitoring**: Enable Vercel Analytics and Supabase Logs.
