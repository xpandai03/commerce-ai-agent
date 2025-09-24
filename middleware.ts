import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware - authentication removed for local development
export function middleware(request: NextRequest) {
  // No authentication required - direct access to all routes
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}