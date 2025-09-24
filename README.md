# Emer Commerce AI Agent

An AI-powered commerce agent for Dr. Jason Emer's aesthetic clinic, featuring streaming chat responses and an admin panel for customization.

## 🚀 Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/xpandai03/commerce-ai-agent.git
cd commerce-ai-agent
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment on Vercel

### Prerequisites
- Vercel account
- OpenAI API key
- (Optional) Supabase account for database features

### Deployment Steps

1. **Import Project on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import from GitHub: `xpandai03/commerce-ai-agent`

2. **Configure Environment Variables**

   In Vercel project settings, add:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ADMIN_PASSWORD=your_secure_admin_password
   ADMIN_PASSWORD_HASH=your_password_hash

   # Optional - for database features
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   ⚠️ **Important**:
   - Add your actual OpenAI API key, not a placeholder
   - Change the default admin password for security
   - Without Supabase, admin panel will use fallback mode

3. **Build Settings**

   Vercel should auto-detect Next.js. If not, use:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## 🔧 Troubleshooting Vercel Deployment

### Common Issues and Solutions

1. **404 Error After Deployment**
   - Ensure Framework Preset is set to "Next.js" in Vercel settings
   - Check that the build completed successfully in Vercel logs

2. **Build Fails with Dependency Errors**
   - The project uses `--legacy-peer-deps` due to version conflicts
   - This is already configured in `vercel.json`

3. **Chat Not Working (500 Error)**
   - Verify `OPENAI_API_KEY` is set in Vercel environment variables
   - Check the function logs in Vercel dashboard

4. **"Paper Shaders" Warning**
   - This warning is normal and doesn't affect functionality
   - Shaders are loaded client-side only to avoid SSR issues

## 📁 Project Structure

```
/
├── app/
│   ├── page.tsx           # Main chat interface
│   ├── api/chat/          # OpenAI streaming endpoint
│   └── admin/             # Admin panel routes
├── components/
│   └── chat-interface.tsx # V0 chat UI component
├── lib/
│   └── supabase.ts        # Database configuration
└── vercel.json            # Vercel deployment config
```

## 🎯 Features

- **AI Chat**: Streaming responses powered by GPT-4 Turbo
- **Admin Panel**: Full CRUD operations for prompts and knowledge base (at `/admin`)
  - **Dynamic Prompts**: Edit system prompts that immediately affect chat behavior
  - **Knowledge Management**: Add, edit, delete knowledge entries
  - **Document Upload**: Upload documents to extract knowledge automatically
  - **Password Protected**: Basic auth protection for admin routes
- **Database Integration**: Optional Supabase for persistent data
- **Beautiful UI**: V0-designed interface with animations
- **Edge Runtime**: Fast, globally distributed API

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key for chat functionality |
| `ADMIN_PASSWORD` | Yes | Password for admin panel access (default: emer2024admin) |
| `ADMIN_PASSWORD_HASH` | Yes | Hash for admin auth cookie |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase URL for database features |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key for database |

## 📝 License

Private repository - All rights reserved

## 🤝 Support

For issues or questions, please open an issue on GitHub.