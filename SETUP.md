# Complete Setup Guide

Step-by-step guide to get the AI Chat MVP running locally and in production.

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Local Development Setup](#local-development-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [LLM Provider Setup](#llm-provider-setup)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)

## Quick Start

Get the app running in 5 minutes with demo mode (no auth required).

### 1. Clone and Install

```bash
cd MVP4_Streaming_AI_Chat
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env.local
```

### 3. Configure Supabase (Free Tier)

Create a free project at https://supabase.com:

1. Click "New Project"
2. Fill in details (any name/password)
3. Wait 2-3 minutes for project creation
4. Copy your URL and anon key to `.env.local`

### 4. Set Up Database

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project (find Project ID in Supabase dashboard)
supabase link --project-ref your-project-id

# Push schema
supabase db push
```

Or manually in Supabase SQL Editor:
1. Copy entire `supabase_schema.sql`
2. Paste into "SQL Editor" → "New Query"
3. Click "Run"

### 5. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo mode** allows 100 free messages. Click "Reset" to continue.

## Local Development Setup

Complete setup for full-featured local development.

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- Git ([download](https://git-scm.com/))
- A text editor (VS Code recommended)
- Supabase account (free at supabase.com)
- OpenAI API key (free tier available)

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd MVP4_Streaming_AI_Chat
```

### Step 2: Install Dependencies

```bash
npm install

# Optionally install Supabase CLI globally
npm install -g supabase
```

Check versions:
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

### Step 3: Environment Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# REQUIRED: Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your-key...

# REQUIRED: OpenAI
OPENAI_API_KEY=sk-...your-key...

# OPTIONAL: For admin operations
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your-key...

# LOCAL DEVELOPMENT
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Finding Your Keys:**

**Supabase:**
1. Go to Supabase Dashboard
2. Settings → API Preferences
3. Copy URL and `anon` key

**OpenAI:**
1. Go to OpenAI API Keys
2. Create new secret key
3. Copy immediately (won't be shown again)

### Step 4: Database Setup

#### Option A: Using Supabase CLI (Recommended)

```bash
# Login to Supabase
supabase login

# List your projects
supabase projects list

# Link your project
supabase link --project-ref your-project-ref

# Push database schema
supabase db push

# Verify schema
supabase db remote-schemas
```

#### Option B: Manual SQL (Backup Method)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "SQL Editor"
4. Click "New Query"
5. Copy the entire contents of `supabase_schema.sql`
6. Paste into the editor
7. Click "Run"

**Verify Tables Created:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see:
- `users`
- `conversations`
- `messages`
- `credit_transactions`

### Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.0.0
  ○ Ready in 2.1s
  ○ Local:        http://localhost:3000
  ○ Environments: .env.local
```

Open http://localhost:3000 in your browser.

### Step 6: Create Test User (Optional)

In Supabase Dashboard → Authentication → Users:
1. Click "Add user"
2. Enter email and password
3. Copy user ID
4. Use for testing

## Supabase Configuration

### Initial Project Setup

1. **Create Project**
   - Visit https://supabase.com
   - Click "New Project"
   - Fill form:
     - Name: `ai-chat-mvp`
     - Database Password: (generate strong password)
     - Region: (closest to you)
   - Click "Create new project"
   - Wait 2-3 minutes

2. **Get Connection Details**
   - After project is ready
   - Settings → API Preferences
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` secret key

3. **Enable Auth Providers**
   - Authentication → Providers
   - Email/Password: Already enabled
   - Optional: Google, GitHub, etc.

4. **Configure Auth URLs**
   - Authentication → Settings
   - Site URL: `http://localhost:3000`
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/error`

### Row Level Security (RLS)

All tables have RLS enabled with policies to:
- Prevent unauthorized access
- Isolate user data
- Allow only admins to modify global settings

Policies included in `supabase_schema.sql`:
- Users can only access their own profile
- Users can only see their own conversations
- Users can only insert messages in their conversations
- Credit transactions are read-only

### Backups

For local development, backups aren't critical, but enable for peace of mind:

1. Settings → Backups
2. Enable "Automated backups"
3. Select backup frequency

## LLM Provider Setup

### OpenAI (Default)

**1. Create Account**
- Visit https://platform.openai.com/signup
- Sign up or log in
- Verify email

**2. Get API Key**
- Go to https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy key immediately (won't be shown again)
- Add to `.env.local`: `OPENAI_API_KEY=sk-...`

**3. Set Up Billing**
- Settings → Billing → Overview
- Add payment method
- Set usage limit (e.g., $10/month)

**4. Integrate in Code**

In production, integrate with `/api/chat/route.ts`:

```typescript
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateAIResponse(userMessage: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are helpful assistant." },
      { role: "user", content: userMessage }
    ],
    stream: true,
  })

  for await (const chunk of response) {
    yield chunk.choices[0]?.delta?.content || ""
  }
}
```

### Alternative Providers

#### Anthropic Claude

```bash
npm install @anthropic-ai/sdk
```

```typescript
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const response = await client.messages.stream({
  model: "claude-3-opus-20240229",
  max_tokens: 1024,
  messages: [{ role: "user", content: userMessage }],
})
```

#### Vercel AI SDK (Recommended)

```bash
npm install ai @ai-sdk/openai
```

```typescript
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

const result = await streamText({
  model: openai("gpt-4"),
  messages: [{ role: "user", content: userMessage }],
})

for await (const chunk of result.textStream) {
  yield chunk
}
```

**Benefits of Vercel AI SDK:**
- Unified API across providers
- Built-in streaming
- Automatic token counting
- Error handling

## Testing

### Manual Testing

1. **Chat Interface**
   - Send test message
   - Verify response streams
   - Check token count
   - Verify credits deducted

2. **Edge Cases**
   - Very long message
   - Special characters
   - Rapid succession messages
   - Close browser mid-response

3. **Database**
   ```sql
   -- Check messages were saved
   SELECT * FROM messages ORDER BY created_at DESC LIMIT 5;

   -- Check conversations
   SELECT * FROM conversations;

   -- Check user credits
   SELECT id, email, credits FROM users;
   ```

### Automated Testing

Create `__tests__/chat.test.ts`:

```typescript
describe('Chat API', () => {
  it('should stream response', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'test',
        userId: 'test-user',
      }),
    })

    expect(response.ok).toBe(true)
    expect(response.status).toBe(200)
  })
})
```

Run tests:
```bash
npm test
```

### Debug Mode

Enable debug logging:

```typescript
// lib/supabase.ts
export const supabase = createClient(url, key, {
  debug: true,
  logger: {
    debug: console.log,
    error: console.error,
  },
})
```

Monitor in browser DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Send message
4. Check request/response

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production guide.

### Quick Summary

```bash
# 1. Create Vercel account
# https://vercel.com/signup

# 2. Import repository
# https://vercel.com/new

# 3. Set environment variables in Vercel dashboard
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# OPENAI_API_KEY

# 4. Deploy
vercel deploy --prod

# 5. Set up domain (optional)
# Vercel → Settings → Domains → Add Domain
```

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution:**
```bash
npm install
npm run dev
```

### Issue: Environment variables not loading

**Solution:**
1. Check `.env.local` exists in project root
2. Restart development server
3. Clear browser cache

### Issue: Supabase connection fails

**Check:**
```bash
# Test connection
curl "https://your-project.supabase.co/rest/v1/users" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

**Solutions:**
- Verify URL is correct (no trailing slash)
- Verify API key is correct
- Check project is active in Supabase dashboard

### Issue: OpenAI API errors

**Verify:**
- API key is correct
- Account has valid payment method
- Usage hasn't exceeded quota
- Model name is correct

### Issue: TypeScript errors

**Solution:**
```bash
npm install
npm run build
```

### Issue: Streaming not working

**Check:**
1. Network tab shows response
2. Response content-type is `application/x-ndjson`
3. Browser supports ReadableStream
4. No proxy interfering with streaming

## Development Workflow

### Project Structure

```
MVP4_Streaming_AI_Chat/
├── app/                       # Next.js app directory
│   ├── page.tsx              # Main chat page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/chat/route.ts     # Chat API endpoint
├── lib/                       # Utilities
│   ├── supabase.ts           # Supabase config
│   ├── tokens.ts             # Token utilities
│   ├── types.ts              # TypeScript types
│   └── hooks/useChat.ts      # Chat hook
├── public/                    # Static files
├── supabase_schema.sql       # Database schema
└── README.md                  # Documentation
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# Commit
git commit -m "Add feature"

# Push
git push origin feature/my-feature

# Create PR on GitHub
```

### Code Style

- Use TypeScript (strict mode)
- Format with Prettier
- Follow ESLint rules
- Write descriptive commit messages

```bash
npm run lint
npm run build
```

## Next Steps

After setup:

1. **Customize UI** - Modify `app/page.tsx`
2. **Integrate LLM** - Update `/api/chat/route.ts`
3. **Add Features**:
   - User authentication UI
   - Conversation history sidebar
   - Model selection
   - Prompt templates
4. **Deploy** - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
5. **Monitor** - Set up error tracking and analytics

## Getting Help

**Documentation:**
- [README.md](./README.md) - Project overview
- [API.md](./API.md) - API reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production guide

**Resources:**
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI Docs](https://platform.openai.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

**Support:**
- GitHub Issues
- GitHub Discussions
- Email support

---

**Ready to build?** Start with Quick Start above, then explore the codebase!
