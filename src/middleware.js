import { NextResponse } from 'next/server'

const publicRoutes = ['/sign-in', '/sign-up', '/verify']
const authRoutes = ['/api/auth/signin', '/api/auth/signout', '/api/auth/callback']

export default async function middleware(req) {
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))

  // Skip middleware for auth routes
  if (isAuthRoute) {
    return NextResponse.next()
  }

  // Check for all possible NextAuth cookie names
  const possibleCookies = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.session-token'
  ]
  
  const token = possibleCookies.reduce((found, cookieName) => {
    return found || req.cookies.get(cookieName)?.value
  }, '')

  // Redirect logged-in users away from public routes
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users from protected routes to sign-in
  if (!isPublicRoute && !token && !isAuthRoute) {
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
    '/edit-profile',
    // Add these to handle auth routes properly
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}