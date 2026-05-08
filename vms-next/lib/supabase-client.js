import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes('supabase.com/dashboard')) {
    console.warn('⚠️ Supabase credentials missing or invalid. Returning mock client.')
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ order: () => ({ limit: () => ({ single: () => ({ data: null, error: null, count: 0 }) }) }) }),
        update: () => ({ eq: () => ({ data: null, error: null }) }),
        insert: () => ({ data: null, error: null }),
      }),
    }
  }

  return createBrowserClient(url, key)
}
