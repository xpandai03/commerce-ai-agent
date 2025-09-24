import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

// Google Drive configuration types
export interface DriveConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  refreshToken?: string
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  size?: string
  webViewLink?: string
}

export interface DriveFolder {
  id: string
  name: string
  files: DriveFile[]
}

class GoogleDriveService {
  private auth: OAuth2Client | null = null
  private drive: any = null

  constructor() {
    this.initializeAuth()
  }

  private initializeAuth() {
    // Initialize OAuth2 client with environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'

    if (clientId && clientSecret) {
      this.auth = new OAuth2Client(
        clientId,
        clientSecret,
        redirectUri
      )

      // If we have a refresh token, set it
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
      if (refreshToken) {
        this.auth.setCredentials({
          refresh_token: refreshToken
        })

        // Initialize Google Drive API
        this.drive = google.drive({ version: 'v3', auth: this.auth })
      }
    }
  }

  // Generate OAuth URL for user authorization
  getAuthUrl(): string {
    if (!this.auth) {
      throw new Error('Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.')
    }

    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file'
    ]

    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      response_type: 'code',
      prompt: 'consent'
    })
  }

  // Exchange authorization code for tokens
  async getTokens(code: string): Promise<any> {
    if (!this.auth) {
      throw new Error('Google OAuth not configured')
    }

    const { tokens } = await this.auth.getToken(code)
    this.auth.setCredentials(tokens)

    // Reinitialize drive with authenticated client
    this.drive = google.drive({ version: 'v3', auth: this.auth })

    return tokens
  }

  // Set refresh token for persistent access
  setRefreshToken(refreshToken: string) {
    if (!this.auth) {
      throw new Error('Google OAuth not configured')
    }

    this.auth.setCredentials({
      refresh_token: refreshToken
    })

    this.drive = google.drive({ version: 'v3', auth: this.auth })
  }

  // List files in a specific folder
  async listFolderContents(folderId: string): Promise<DriveFile[]> {
    if (!this.drive) {
      throw new Error('Google Drive API not initialized. Please authenticate first.')
    }

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 100
      })

      return response.data.files || []
    } catch (error) {
      console.error('Error listing folder contents:', error)
      throw new Error(`Failed to list folder contents: ${error.message}`)
    }
  }

  // Get file content based on its type
  async getFileContent(fileId: string, mimeType: string): Promise<string> {
    if (!this.drive) {
      throw new Error('Google Drive API not initialized')
    }

    try {
      // Handle Google Docs
      if (mimeType === 'application/vnd.google-apps.document') {
        const response = await this.drive.files.export({
          fileId: fileId,
          mimeType: 'text/plain'
        })
        return response.data
      }

      // Handle Google Sheets
      if (mimeType === 'application/vnd.google-apps.spreadsheet') {
        const response = await this.drive.files.export({
          fileId: fileId,
          mimeType: 'text/csv'
        })
        return response.data
      }

      // Handle regular files (PDF, TXT, etc.)
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      })

      // For binary files like PDF, return as base64
      if (mimeType === 'application/pdf') {
        return Buffer.from(response.data).toString('base64')
      }

      return response.data
    } catch (error) {
      console.error('Error getting file content:', error)
      throw new Error(`Failed to get file content: ${error.message}`)
    }
  }

  // Get folder metadata
  async getFolderInfo(folderId: string): Promise<any> {
    if (!this.drive) {
      throw new Error('Google Drive API not initialized')
    }

    try {
      const response = await this.drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType, createdTime, modifiedTime'
      })

      return response.data
    } catch (error) {
      console.error('Error getting folder info:', error)
      throw new Error(`Failed to get folder info: ${error.message}`)
    }
  }

  // Extract folder ID from Google Drive URL
  extractFolderId(urlOrId: string): string {
    // If it's already just an ID, return it
    if (!urlOrId.includes('/')) {
      return urlOrId
    }

    // Extract from URL patterns:
    // https://drive.google.com/drive/folders/FOLDER_ID
    // https://drive.google.com/drive/u/0/folders/FOLDER_ID
    const match = urlOrId.match(/\/folders\/([a-zA-Z0-9-_]+)/)
    if (match) {
      return match[1]
    }

    throw new Error('Invalid Google Drive folder URL or ID')
  }

  // Check if service is configured and authenticated
  isConfigured(): boolean {
    return this.auth !== null
  }

  isAuthenticated(): boolean {
    return this.drive !== null
  }
}

// Create singleton instance
const googleDriveService = new GoogleDriveService()

export default googleDriveService