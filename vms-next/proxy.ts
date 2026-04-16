import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register')

  // Redirection rules if not logged in
  if (!user && (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/approve'))) {
     return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in, fetch profile for role based bouncing
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || 'visitor'

    // Prevent going back to login if already logged in
    if (isAuthRoute) {
        if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
        if (role === 'security') return NextResponse.redirect(new URL('/dashboard', request.url))
        if (role === 'pic') return NextResponse.redirect(new URL('/approve', request.url))
        return NextResponse.redirect(new URL('/', request.url)) // visitor default
    }

    // Role Route Fencing
    if (path.startsWith('/admin') && role !== 'admin') {
       return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (path.startsWith('/dashboard') && role !== 'security') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (path.startsWith('/approve') && role !== 'pic') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
