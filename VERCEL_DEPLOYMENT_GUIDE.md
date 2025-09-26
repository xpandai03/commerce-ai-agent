# Vercel Deployment Guide

## Step 1: Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add the following:

### Required Variables:

1. **OPENAI_API_KEY** (Required)
   - Your OpenAI API key for chat functionality
   - Get from: https://platform.openai.com/api-keys

2. **ADMIN_PASSWORD** (Required)
   - Password for admin panel access
   - **IMPORTANT**: Change from default `emer2024admin` to something secure!
   - Example: `your-secure-password-here`

3. **ADMIN_PASSWORD_HASH** (Required)
   - Set to: `authorized`
   - This is used for session validation

### Optional Variables (for full functionality):

4. **Google Drive Integration** (Optional)
   - **GOOGLE_CLIENT_ID**: Your Google OAuth client ID
   - **GOOGLE_CLIENT_SECRET**: Your Google OAuth client secret
   - **GOOGLE_REDIRECT_URI**: Should be `https://your-domain.vercel.app/api/auth/google/callback`
   - **GOOGLE_REFRESH_TOKEN**: Will be auto-populated after first authentication

   **Important for Google Drive:**
   - Update redirect URI to your Vercel domain (not localhost)
   - Go to Google Cloud Console → OAuth 2.0 → Edit your credentials
   - Add `https://your-domain.vercel.app/api/auth/google/callback` to Authorized redirect URIs

5. **Supabase (Optional - for persistent storage)**
   - **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anon key

## Step 2: Update Configuration Files

### Update `middleware.ts` for production domain:
The middleware currently has localhost hardcoded. It will auto-detect in production, but you can update if needed.

### Update Admin Panel Links:
The chat interface buttons are configured to open admin panel in new tabs. This will work automatically with your Vercel domain.

## Step 3: Deploy to Vercel

### Option A: Through Vercel Dashboard
1. Import your GitHub repository in Vercel
2. Vercel will auto-detect Next.js
3. Add environment variables (as listed above)
4. Click Deploy

### Option B: Through CLI
```bash
npm install -g vercel
vercel
# Follow the prompts
# Add environment variables when prompted or in dashboard later
```

## Step 4: Post-Deployment Setup

1. **Test the chat interface**: Go to your-domain.vercel.app
2. **Test admin panel**: Go to your-domain.vercel.app/admin
3. **Login with your ADMIN_PASSWORD**
4. **Configure Google Drive** (if using):
   - Go to Admin → Settings → Google Drive
   - Click "Connect Google Drive"
   - Authorize and select folder

## Important Security Notes:

1. **Change ADMIN_PASSWORD**: Never use the default password in production
2. **Protect API Keys**: Never commit API keys to git
3. **CORS Settings**: The app currently allows all origins. Consider restricting in production.
4. **Rate Limiting**: Consider adding rate limiting for production use

## Troubleshooting:

### Chat not working?
- Check OPENAI_API_KEY is set correctly
- Verify API key has sufficient credits

### Admin panel access denied?
- Check ADMIN_PASSWORD is set
- Clear cookies and try again
- Check ADMIN_PASSWORD_HASH is set to "authorized"

### Google Drive not connecting?
- Ensure redirect URI matches your Vercel domain
- Check all Google credentials are correct
- Re-authenticate if refresh token expires

### Build fails?
- Check package.json for any local dependencies
- Ensure all environment variables are set
- Check Vercel build logs for specific errors

## Production Checklist:

- [ ] Changed ADMIN_PASSWORD from default
- [ ] Set all required environment variables
- [ ] Updated Google OAuth redirect URI (if using)
- [ ] Tested chat functionality
- [ ] Tested admin panel access
- [ ] Configured knowledge base (if needed)
- [ ] Set up system prompts

## Support:

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure your domain is properly configured
4. Check browser console for client-side errors