import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const LOGIN_PATH = '/painel/login'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (entries) => {
        for (const { name, value } of entries) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of entries) response.cookies.set(name, value, options)
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const isLogin = request.nextUrl.pathname === LOGIN_PATH

  if (!data?.claims && !isLogin) {
    const login = request.nextUrl.clone()
    login.pathname = LOGIN_PATH
    login.search = ''
    return NextResponse.redirect(login)
  }

  if (data?.claims && isLogin) {
    const home = request.nextUrl.clone()
    home.pathname = '/painel'
    home.search = ''
    return NextResponse.redirect(home)
  }

  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

export const config = {
  matcher: ['/painel/:path*'],
}
