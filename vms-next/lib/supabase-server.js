import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url.includes('supabase.com/dashboard')) {
    console.warn('⚠️ Supabase server credentials missing. Returning mock.')
    return mockClient()
  }

  const cookieStore = cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {}
      },
    },
  })
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key || key.includes('YOUR_')) {
    console.warn('⚠️ Admin credentials missing. Returning mock.')
    return mockClient()
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() { return [] },
      setAll() {},
    },
  })
}

function mockClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      admin: {
        updateUserById: async () => ({ data: { user: null }, error: null }),
      }
    },
    from: () => ({
      select: () => ({ order: () => ({ limit: () => ({ single: () => ({ data: null, error: null }) }) }) }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
    }),
  }
}
