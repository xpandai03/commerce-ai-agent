import { NextResponse } from 'next/server'
import googleDriveService from '@/lib/google-drive'

export async function GET() {
  try {
    const isConfigured = googleDriveService.isConfigured()
    const isAuthenticated = googleDriveService.isAuthenticated()

    // Get connected folder from memory store if exists
    const folderUrl = global.driveFolder?.url || null
    const folderName = global.driveFolder?.name || null

    return NextResponse.json({
      configured: isConfigured,
      authenticated: isAuthenticated,
      folderConnected: !!folderUrl,
      folderUrl,
      folderName
    })
  } catch (error) {
    console.error('Error checking drive status:', error)
    return NextResponse.json({
      configured: false,
      authenticated: false,
      folderConnected: false
    })
  }
}