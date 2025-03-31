import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/sign-in', '/sign-up', '/verify']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  const isPublicRoute = publicRoutes.includes(path)

  const token = req.cookies.get('next-auth.session-token')?.value || '';

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: [
    '/', '/sign-in', '/sign-up', '/verify', '/dashboard', '/edit-profile'
  ],
}