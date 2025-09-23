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

### Deployment Steps

1. **Import Project on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import from GitHub: `xpandai03/commerce-ai-agent`

2. **Configure Environment Variables**

   In Vercel project settings, add:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

   ⚠️ **Important**: Make sure to add your actual OpenAI API key, not a placeholder

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
- **Admin Panel**: Manage prompts and knowledge base (at `/admin`)
- **Beautiful UI**: V0-designed interface with animations
- **Edge Runtime**: Fast, globally distributed API

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key for chat functionality |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase URL for admin features (future) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key (future) |

## 📝 License

Private repository - All rights reserved

## 🤝 Support

For issues or questions, please open an issue on GitHub.