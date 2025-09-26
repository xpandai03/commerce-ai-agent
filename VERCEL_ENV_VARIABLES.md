# Vercel Environment Variables for commerce-ai-agent.vercel.app

## Copy and paste these into Vercel Dashboard → Settings → Environment Variables

### 1. OpenAI Configuration (REQUIRED)
```
OPENAI_API_KEY=your_openai_api_key_from_local_env_file
```
⚠️ **Get your actual key from `.env.local` file - DO NOT commit to git!**

### 2. Admin Authentication (REQUIRED - CHANGE PASSWORD!)
```
ADMIN_PASSWORD=emer2024admin
ADMIN_PASSWORD_HASH=authorized
```
⚠️ **IMPORTANT**: Change `ADMIN_PASSWORD` to something secure before deploying!

### 3. Google Drive Integration (OPTIONAL but recommended)
```
GOOGLE_CLIENT_ID=your_google_client_id_from_local_env_file
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_local_env_file
GOOGLE_REDIRECT_URI=https://commerce-ai-agent.vercel.app/api/auth/google/callback
```
⚠️ **Get your actual credentials from `.env.local` file - DO NOT commit to git!**

**Note**: Do NOT add `GOOGLE_REFRESH_TOKEN` yet - it will be automatically generated after first authentication.

---

## CRITICAL: Update Google Cloud Console

Since you're moving from localhost to production, you MUST update your Google OAuth settings:

### Steps to Update Google OAuth:

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com
   - Select your project

2. **Navigate to OAuth 2.0 Credentials**:
   - Go to: APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID (the one ending in `...429.apps.googleusercontent.com`)

3. **Add Production Redirect URI**:
   - In "Authorized redirect URIs" section, ADD (don't replace):
   ```
   https://commerce-ai-agent.vercel.app/api/auth/google/callback
   ```
   - Keep the localhost one for local development
   - Click "Save"

4. **Authorized JavaScript Origins** (if present):
   - Add:
   ```
   https://commerce-ai-agent.vercel.app
   ```

---

## How to Add These to Vercel:

1. Go to: https://vercel.com/dashboard
2. Select your `commerce-ai-agent` project
3. Go to Settings → Environment Variables
4. For each variable above:
   - Add the KEY (e.g., `OPENAI_API_KEY`)
   - Add the VALUE (the part after the `=`)
   - Select environments: Production, Preview, Development
   - Click "Save"

---

## After Deployment:

1. **First Time Google Drive Setup**:
   - Go to: https://commerce-ai-agent.vercel.app/admin
   - Login with your ADMIN_PASSWORD
   - Navigate to Settings or Google Drive section
   - Click "Connect Google Drive"
   - Authorize with Google
   - The `GOOGLE_REFRESH_TOKEN` will be automatically saved

2. **Test Everything**:
   - Chat interface: https://commerce-ai-agent.vercel.app
   - Admin panel: https://commerce-ai-agent.vercel.app/admin
   - All buttons in chat should open admin panel sections

---

## Security Checklist Before Going Live:

- [ ] Changed `ADMIN_PASSWORD` from default `emer2024admin`
- [ ] Updated Google OAuth redirect URI in Google Cloud Console
- [ ] Added all environment variables to Vercel
- [ ] Verified OpenAI API key has credits
- [ ] Tested deployment after adding variables

---

## Troubleshooting:

**Google Drive not connecting?**
- Make sure you updated the redirect URI in Google Cloud Console
- Clear browser cookies and try again
- Check Vercel function logs for errors

**Admin panel access denied?**
- Verify ADMIN_PASSWORD is set in Vercel
- Make sure ADMIN_PASSWORD_HASH is set to "authorized"
- Clear browser cookies

**Chat not working?**
- Check OpenAI API key is valid and has credits
- Look at Vercel function logs for API errors