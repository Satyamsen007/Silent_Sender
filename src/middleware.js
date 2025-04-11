import { NextResponse } from 'next/server'

const publicRoutes = ['/sign-in', '/sign-up', '/verify']

export default async function middleware(req) {
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)

  // Check for both development and production cookie names
  const token = req.cookies.get('next-auth.session-token')?.value || 
                req.cookies.get('__Secure-next-auth.session-token')?.value

  // Redirect logged-in users away from public routes
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users from protected routes to sign-in
  if (!isPublicRoute && !token) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/sign-in',
    '/sign-up',
    '/verify',
    '/dashboard',
    '/dashboard/:path*',
    '/edit-profile'
  ]
}