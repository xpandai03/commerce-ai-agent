import { NextRequest, NextResponse } from 'next/server'
import googleDriveService from '@/lib/google-drive'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Handle user denial
    if (error) {
      return NextResponse.redirect(
        new URL('/admin/knowledge?error=auth_denied', request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/knowledge?error=no_code', request.url)
      )
    }

    // Exchange code for tokens
    const tokens = await googleDriveService.getTokens(code)

    // Store the refresh token (in production, store this securely in database)
    // For now, we'll prompt user to add it to environment variables
    console.log('=== GOOGLE AUTHENTICATION SUCCESS ===')
    console.log('Add this to your .env.local file:')
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
    console.log('=====================================')

    // Redirect back to admin with success
    return NextResponse.redirect(
      new URL('/admin/knowledge?success=google_connected', request.url)
    )
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/admin/knowledge?error=auth_failed', request.url)
    )
  }
}