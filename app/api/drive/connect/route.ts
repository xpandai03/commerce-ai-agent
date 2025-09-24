import { NextRequest, NextResponse } from 'next/server'
import googleDriveService from '@/lib/google-drive'

// Global store for connected folder
declare global {
  var driveFolder: { url: string, name: string } | undefined
}

export async function POST(request: NextRequest) {
  try {
    const { folderUrl } = await request.json()

    if (!folderUrl) {
      return NextResponse.json({ error: 'Folder URL is required' }, { status: 400 })
    }

    if (!googleDriveService.isAuthenticated()) {
      return NextResponse.json({ error: 'Not authenticated with Google Drive' }, { status: 401 })
    }

    // Extract folder ID and get folder info
    const folderId = googleDriveService.extractFolderId(folderUrl)
    const folderInfo = await googleDriveService.getFolderInfo(folderId)

    // Store folder connection globally
    global.driveFolder = {
      url: folderUrl,
      name: folderInfo.name
    }

    return NextResponse.json({
      success: true,
      folderId,
      folderName: folderInfo.name
    })
  } catch (error: any) {
    console.error('Error connecting folder:', error)
    return NextResponse.json({
      error: error.message || 'Failed to connect folder'
    }, { status: 500 })
  }
}