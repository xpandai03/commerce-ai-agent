# Step-by-Step Google Credentials Setup Guide

## Quick Links
- **Google Cloud Console**: https://console.cloud.google.com
- **Create New Project**: https://console.cloud.google.com/projectcreate
- **API Library**: https://console.cloud.google.com/apis/library

## Step 1: Create or Select a Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Sign in with your Google account

2. **Create a New Project** (or use existing)
   - Click the project dropdown at the top (next to "Google Cloud")
   - Click "New Project"
   - Project name: `Emer Commerce Agent` (or your preference)
   - Click "Create"
   - Wait for project creation (takes ~30 seconds)

## Step 2: Enable Google Drive API

1. **Open API Library**
   - Direct link: https://console.cloud.google.com/apis/library
   - Or: Menu (☰) → "APIs & Services" → "Library"

2. **Search and Enable Drive API**
   - In search bar, type: `Google Drive API`
   - Click on "Google Drive API" card
   - Click the blue "ENABLE" button
   - Wait for it to enable (few seconds)

## Step 3: Create OAuth 2.0 Credentials

### Configure OAuth Consent Screen (First Time Only)

1. **Go to OAuth Consent Screen**
   - Menu → "APIs & Services" → "OAuth consent screen"
   - Or direct: https://console.cloud.google.com/apis/credentials/consent

2. **Choose User Type**
   - Select "External" (allows any Google account)
   - Click "CREATE"

3. **Fill App Information**
   - **App name**: `Emer AI Assistant`
   - **User support email**: Select your email
   - **Developer contact**: Your email
   - Skip logo (optional)
   - Click "SAVE AND CONTINUE"

4. **Add Scopes**
   - Click "ADD OR REMOVE SCOPES"
   - Search for and check these scopes:
     - `.../auth/drive.readonly` (Read-only access to Drive)
     - `.../auth/drive.file` (Access to files created by app)
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"

5. **Test Users** (Optional)
   - Add your email as a test user if you want
   - Click "SAVE AND CONTINUE"

6. **Review**
   - Click "BACK TO DASHBOARD"

### Create OAuth Client ID

1. **Go to Credentials Page**
   - Menu → "APIs & Services" → "Credentials"
   - Or direct: https://console.cloud.google.com/apis/credentials

2. **Create OAuth Client ID**
   - Click "+ CREATE CREDENTIALS" button (top)
   - Select "OAuth client ID"

3. **Configure OAuth Client**
   - **Application type**: `Web application`
   - **Name**: `Emer Commerce Web Client`

4. **Add Authorized Redirect URIs**
   - Under "Authorized redirect URIs", click "+ ADD URI"
   - Add this exact URI:
     ```
     http://localhost:3000/api/auth/google/callback
     ```
   - For production later, add:
     ```
     https://your-domain.com/api/auth/google/callback
     ```

5. **Create the Client**
   - Click "CREATE" button
   - A popup will show your credentials!

## Step 4: Copy Your Credentials

**IMPORTANT**: A popup will appear with your credentials. Copy them immediately!

```
Your Client ID:
[long-string].apps.googleusercontent.com

Your Client Secret:
GOCSPX-[random-characters]
```

**⚠️ Save these somewhere safe temporarily - you'll need them in the next step!**

## Step 5: Add Credentials to Your App

1. **Open your `.env.local` file**

2. **Add the credentials**:
```env
GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-paste-your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

3. **Save the file**

## Step 6: Restart Your Development Server

```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

## Step 7: Test the Connection

1. **Check configuration status**:
```bash
curl http://localhost:3000/api/drive/test | jq
```

You should see:
```json
{
  "status": {
    "configured": true,
    "authenticated": false,
    "ready": false
  },
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "instructions": "Please authenticate with Google Drive using the authUrl"
}
```

2. **Copy the `authUrl` and visit it in your browser**

3. **Authorize the app**:
   - Sign in with your Google account
   - Review permissions
   - Click "Continue" or "Allow"

4. **After redirect, check your terminal**
   - Look for a message with `GOOGLE_REFRESH_TOKEN=...`
   - Copy that refresh token

5. **Add refresh token to `.env.local`**:
```env
GOOGLE_REFRESH_TOKEN=paste-the-refresh-token-here
```

6. **Test again**:
```bash
curl http://localhost:3000/api/drive/test | jq
```

Should now show:
```json
{
  "status": {
    "configured": true,
    "authenticated": true,
    "ready": true
  },
  "instructions": "Google Drive is ready to use!"
}
```

## Troubleshooting

### "Redirect URI mismatch" Error
- Make sure the redirect URI in Google Console EXACTLY matches:
  `http://localhost:3000/api/auth/google/callback`
- No trailing slashes!

### "Access blocked" Error
- Make sure OAuth consent screen is configured
- Try adding your email as a test user

### Can't find credentials after creating
- Go to: https://console.cloud.google.com/apis/credentials
- Click on your OAuth 2.0 Client ID name
- You can view/copy credentials there

### "This app hasn't been verified" Warning
- This is normal for development
- Click "Advanced" → "Go to Emer AI Assistant (unsafe)"
- This warning goes away after Google verification (for production)

## Need More Help?

If you get stuck at any step, let me know which specific step and what error you're seeing!