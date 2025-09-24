import { NextRequest, NextResponse } from 'next/server'
import googleDriveService from '@/lib/google-drive'

export async function POST(request: NextRequest) {
  try {
    const { folderUrl } = await request.json()

    if (!folderUrl) {
      return NextResponse.json({ error: 'Folder URL or ID is required' }, { status: 400 })
    }

    // Check if authenticated
    if (!googleDriveService.isAuthenticated()) {
      // Try to authenticate with refresh token from env
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
      if (refreshToken) {
        googleDriveService.setRefreshToken(refreshToken)
      } else {
        return NextResponse.json({ error: 'Not authenticated with Google Drive' }, { status: 401 })
      }
    }

    // Extract folder ID from URL if needed
    const folderId = googleDriveService.extractFolderId(folderUrl)

    // Get folder info
    const folderInfo = await googleDriveService.getFolderInfo(folderId)

    // List files in folder
    const files = await googleDriveService.listFolderContents(folderId)

    return NextResponse.json({
      folderId,
      folderInfo,
      files
    })
  } catch (error: any) {
    console.error('Error loading folder:', error)
    return NextResponse.json({
      error: error.message || 'Failed to load folder contents'
    }, { status: 500 })
  }
}