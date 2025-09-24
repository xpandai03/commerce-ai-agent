import { NextResponse } from 'next/server'
import googleDriveService from '@/lib/google-drive'

export async function GET() {
  try {
    // Test configuration status
    const isConfigured = googleDriveService.isConfigured()
    const isAuthenticated = googleDriveService.isAuthenticated()

    // Check environment variables
    const hasClientId = !!process.env.GOOGLE_CLIENT_ID
    const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET
    const hasRefreshToken = !!process.env.GOOGLE_REFRESH_TOKEN

    let authUrl = null
    if (isConfigured && !isAuthenticated) {
      try {
        authUrl = googleDriveService.getAuthUrl()
      } catch (error) {
        console.error('Error getting auth URL:', error)
      }
    }

    return NextResponse.json({
      status: {
        configured: isConfigured,
        authenticated: isAuthenticated,
        ready: isConfigured && isAuthenticated
      },
      environment: {
        hasClientId,
        hasClientSecret,
        hasRefreshToken,
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
      },
      authUrl,
      instructions: !isConfigured
        ? 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local'
        : !isAuthenticated
        ? 'Please authenticate with Google Drive using the authUrl'
        : 'Google Drive is ready to use!'
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}