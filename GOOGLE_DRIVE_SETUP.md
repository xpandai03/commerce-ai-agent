# Google Drive Integration Setup Guide

## Phase 1 Complete ✅

### What's Been Implemented

1. **Google Drive Service** (`lib/google-drive.ts`)
   - OAuth2 authentication flow
   - Folder listing and file access
   - Support for Google Docs, Sheets, and PDFs
   - File content extraction methods

2. **API Endpoints**
   - `/api/drive/connect` - Check authentication status and get OAuth URL
   - `/api/drive/folder` - List contents of a Drive folder
   - `/api/drive/test` - Test configuration and connection
   - `/api/auth/google/callback` - OAuth callback handler

3. **Environment Configuration**
   - Google OAuth credentials placeholders in `.env.local`
   - Support for refresh token persistence

## Setup Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable the **Google Drive API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth consent screen if prompted:
   - Choose "External" user type
   - Fill in required fields (app name, support email)
   - Add scopes: `drive.readonly` and `drive.file`
4. For Application type, choose "Web application"
5. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
   For production, add your production URL

### 3. Configure Environment Variables

Add your credentials to `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 4. Authenticate with Google Drive

1. Test your configuration:
   ```bash
   curl http://localhost:3000/api/drive/test
   ```

2. If configured correctly, you'll receive an auth URL
3. Visit the auth URL in your browser
4. Authorize the application
5. After redirect, check your console for the refresh token
6. Add the refresh token to `.env.local`:
   ```env
   GOOGLE_REFRESH_TOKEN=your-refresh-token-here
   ```

## Testing the Integration

### Check Connection Status
```bash
curl http://localhost:3000/api/drive/test | jq
```

### List Folder Contents
```bash
# Replace FOLDER_ID with your Google Drive folder ID
curl "http://localhost:3000/api/drive/folder?folderId=FOLDER_ID" | jq
```

## Extracting Folder ID from Google Drive

1. Open your Google Drive folder in browser
2. The URL will look like:
   ```
   https://drive.google.com/drive/folders/1ABC123DEF456GHI789
   ```
3. The folder ID is: `1ABC123DEF456GHI789`

## Next Steps (Phase 2-5)

- **Phase 2**: File Processing Pipeline - Convert Drive files to knowledge entries
- **Phase 3**: Admin Interface Integration - Add Drive management to admin panel
- **Phase 4**: Automated Sync System - Monitor and sync changes automatically
- **Phase 5**: Migration - Replace PDF upload with Drive as primary source

## API Usage Examples

### Connect to Google Drive
```javascript
const response = await fetch('/api/drive/connect')
const data = await response.json()
if (!data.authenticated) {
  window.location.href = data.authUrl
}
```

### List Folder Contents
```javascript
const response = await fetch('/api/drive/folder?folderId=YOUR_FOLDER_ID')
const data = await response.json()
console.log('Files:', data.files)
```

## Troubleshooting

1. **"Not configured" error**: Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
2. **"Not authenticated" error**: Complete OAuth flow and add GOOGLE_REFRESH_TOKEN
3. **403 errors**: Check that Drive API is enabled in Google Cloud Console
4. **Invalid folder ID**: Use the extraction method above to get correct ID

## Security Notes

- Never commit Google credentials to git
- Use environment variables for all sensitive data
- Refresh tokens provide persistent access - keep them secure
- Consider implementing rate limiting for API endpoints