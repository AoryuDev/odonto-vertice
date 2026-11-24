import { createServerClient } from '@supabase/ssr'
import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

const PANEL_PATH = /^\/(pt|en)\/painel(?:\/|$)/

async function guardPanel(request: NextRequest, response: NextResponse): Promise<NextResponse> {
  const match = PANEL_PATH.exec(request.nextUrl.pathname)
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY
  if (!match || !url || !key) return response

  const locale = match[1]
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (entries) => {
        for (const { name, value, options } of entries) response.cookies.set(name, value, options)
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const loginPath = `/${locale}/painel/login`
  const isLogin = request.nextUrl.pathname === loginPath

  if (!data?.claims && !isLogin) return redirectWithCookies(request, loginPath, response)
  if (data?.claims && isLogin) return redirectWithCookies(request, `/${locale}/painel`, response)

  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

function redirectWithCookies(request: NextRequest, pathname: string, source: NextResponse) {
  const target = request.nextUrl.clone()
  target.pathname = pathname
  target.search = ''
  const redirect = NextResponse.redirect(target)
  for (const cookie of source.cookies.getAll()) redirect.cookies.set(cookie)
  return redirect
}

export default async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request)
  if (response.headers.has('location')) return response
  return guardPanel(request, response)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
