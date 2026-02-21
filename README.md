# AI Chat MVP - Production-Ready Streaming AI Chat Application

A professional, full-stack streaming AI chat application built with Next.js, React, and Supabase. This MVP demonstrates best practices in modern web development, real-time streaming, and token-based credit systems.

## Overview

This is a consumer-facing AI chat application that showcases:

- **Streaming AI Responses**: Real-time character-by-character response streaming with typewriter effect
- **Token Counting & Billing**: Accurate token counting using js-tiktoken for fair usage-based billing
- **Supabase Integration**: Full authentication and data persistence with Row-Level Security
- **Credit System**: Per-user credit management for API usage tracking
- **Responsive Design**: Beautiful, modern UI built with Tailwind CSS
- **Production-Ready Code**: Properly typed TypeScript, error handling, and best practices

## Features

### Core Features

✅ **Real-Time Chat Interface**
- Clean, modern UI with gradient backgrounds and smooth animations
- Message history display with role-based styling
- Streaming response with typewriter effect
- Auto-scrolling conversation view

✅ **Token & Credit Management**
- Automatic token counting for both user and AI messages
- Credit deduction based on token usage
- Real-time credit balance display
- Insufficient credit warnings

✅ **Conversation Management**
- Automatic conversation creation from first message
- Conversation history persistence in Supabase
- Message threading with timestamps
- Conversation metadata (title, model, etc.)

✅ **Security & Authentication**
- Supabase Auth integration (JWT-based)
- Row-Level Security (RLS) policies on all tables
- Service role key for backend operations
- User data isolation

### Architecture Highlights

```
Frontend (React/Next.js)
├── Components
│   └── Chat Interface (page.tsx)
├── Hooks
│   └── Message streaming and state management
└── Utilities
    ├── Token counting (lib/tokens.ts)
    ├── Supabase client (lib/supabase.ts)
    └── Type definitions (lib/types.ts)

Backend (Next.js API Routes)
├── /api/chat
│   ├── Stream response generation
│   ├── Token counting
│   ├── Credit management
│   └── Message persistence

Database (Supabase/PostgreSQL)
├── users (profile + credits)
├── conversations (grouped chats)
├── messages (individual messages)
└── credit_transactions (audit trail)
```

## Tech Stack

### Frontend
- **Next.js 14** - React framework with built-in optimizations
- **React 18** - UI library with hooks
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful, consistent icons
- **Zustand** - Lightweight state management (optional)

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **TypeScript** - Type-safe development
- **js-tiktoken** - Token counting for OpenAI models

### Database & Auth
- **Supabase** - PostgreSQL + Auth + Realtime
- **PostgreSQL** - Robust data storage
- **JWT Authentication** - Secure user sessions

### Integrations (Ready to Connect)
- **OpenAI API** - GPT-4, GPT-3.5-turbo
- **Anthropic Claude** - Alternative LLM provider
- **Stripe** - Credit purchasing and subscription management
- **Twilio** - SMS notifications and authentication

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier available)
- OpenAI API key or alternative LLM provider
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd MVP4_Streaming_AI_Chat
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-api-key
```

4. **Set up the database**

a. Create a new Supabase project at https://supabase.com

b. In the Supabase dashboard, go to SQL Editor and run:
```sql
-- Copy the entire contents of supabase_schema.sql
```

c. Or use the Supabase CLI:
```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
MVP4_Streaming_AI_Chat/
├── app/
│   ├── page.tsx              # Main chat interface
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       └── chat/
│           └── route.ts      # Chat streaming endpoint
├── lib/
│   ├── supabase.ts           # Supabase client & utilities
│   ├── tokens.ts             # Token counting utilities
│   └── types.ts              # TypeScript interfaces
├── public/                   # Static assets
├── supabase_schema.sql       # Database schema
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## API Reference

### POST /api/chat

Streams an AI response based on user message.

**Request:**
```json
{
  "message": "What is an AI?",
  "conversationId": "uuid-or-null",
  "userId": "user-id-from-auth"
}
```

**Response Stream (NDJSON):**
```json
{"type": "content", "data": "I"}
{"type": "content", "data": " "}
{"type": "content", "data": "a"}
...
{"type": "tokens", "data": {"userTokens": 5, "aiTokens": 150, "totalTokens": 155, "creditsUsed": 1}}
{"type": "done", "data": {"conversationId": "uuid", "creditsRemaining": 49999}}
```

**Error Response:**
```json
{
  "error": "Insufficient credits"
}
```

## Database Schema

### Users Table
```sql
id (UUID, Primary Key)
email (VARCHAR)
full_name (VARCHAR)
avatar_url (VARCHAR)
credits (INTEGER) -- in cents
total_spent (INTEGER)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Conversations Table
```sql
id (UUID, Primary Key)
user_id (UUID, Foreign Key)
title (VARCHAR)
description (TEXT)
model (VARCHAR) -- 'gpt-4', 'gpt-3.5-turbo', etc.
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Messages Table
```sql
id (UUID, Primary Key)
conversation_id (UUID, Foreign Key)
role (ENUM: 'user', 'assistant', 'system')
content (TEXT)
tokens_used (INTEGER)
created_at (TIMESTAMP)
```

### Credit Transactions Table
```sql
id (UUID, Primary Key)
user_id (UUID, Foreign Key)
amount (INTEGER) -- negative for deduction, positive for purchase
reason (VARCHAR) -- 'chat_usage', 'purchase', 'refund'
conversation_id (UUID, Foreign Key)
metadata (JSONB)
created_at (TIMESTAMP)
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | Optional |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Optional |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Optional |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Optional |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Optional |

### Token Pricing

Default configuration (can be adjusted):
- **1 token = 0.001 credits** ($0.00001)
- **Minimum charge = 1 credit** ($0.00010)

For different pricing models, modify the `calculateCreditCost()` function in `lib/tokens.ts`.

## Integrating LLM Providers

### OpenAI (Recommended for this template)

```typescript
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: userMessage }
  ],
  stream: true,
})
```

### Anthropic Claude

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const response = await client.messages.stream({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: userMessage }
  ],
})
```

### Using Vercel AI SDK (Recommended)

```typescript
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

const result = await streamText({
  model: openai('gpt-4'),
  messages: [
    { role: 'user', content: userMessage }
  ],
})
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Visit https://vercel.com/new
- Import the repository
- Add environment variables
- Deploy

3. **Set up Supabase webhook** (optional)
```bash
npx supabase functions deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t ai-chat-mvp .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  ai-chat-mvp
```

### Self-Hosted

```bash
npm run build
npm start
```

Or with PM2:
```bash
pm2 start npm --name "ai-chat" -- start
pm2 save
pm2 startup
```

## Security Considerations

1. **Never expose service role key** on the client side
2. **Use environment variables** for all secrets
3. **Enable RLS policies** in Supabase (included in schema)
4. **Validate all inputs** on the backend
5. **Rate limit API endpoints** in production
6. **Use HTTPS only** in production
7. **Implement CORS properly** to restrict domains
8. **Monitor token usage** to prevent abuse
9. **Add authentication** to all API routes
10. **Keep dependencies updated** regularly

## Performance Optimization

- **Server-side rendering** for faster initial load
- **Streaming responses** to reduce perceived latency
- **Database indexes** on frequently queried columns
- **Token pagination** for large conversations
- **Image optimization** with Next.js Image component
- **Code splitting** automatic with Next.js
- **Caching headers** for static assets

## Monitoring & Analytics

### Suggested Tools

- **Vercel Analytics** - Built-in performance monitoring
- **Supabase Logs** - Database query and function logs
- **Sentry** - Error tracking and performance monitoring
- **LogRocket** - Frontend session recording
- **Mixpanel/Amplitude** - User analytics

### Key Metrics to Track

- API response times
- Token usage per user
- Credit purchase conversion
- Error rates
- User retention
- Average conversation length

## Future Enhancements

### Phase 2
- [ ] User authentication UI (signup/login)
- [ ] Stripe integration for credit purchases
- [ ] Conversation sidebar with history
- [ ] Conversation search
- [ ] User settings/preferences

### Phase 3
- [ ] Twilio SMS integration for notifications
- [ ] Admin dashboard
- [ ] Model selection UI
- [ ] Prompt templates
- [ ] Conversation sharing

### Phase 4
- [ ] Multi-user collaboration
- [ ] File upload support
- [ ] Image generation
- [ ] Voice input/output
- [ ] Mobile app

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart the development server after adding env vars

### "Insufficient credits" error
- Check user credits in Supabase dashboard
- Verify credit deduction logic in `/api/chat`
- Reset demo by clicking the Reset button

### "RLS policy violation"
- Ensure user is authenticated
- Check RLS policies in Supabase
- Verify `auth.uid()` is correctly set

### Streaming not working
- Check browser console for errors
- Verify `/api/chat` endpoint is returning proper NDJSON format
- Test with `curl -N` to ensure streaming works

### Token counting inaccuracy
- js-tiktoken may differ from actual API token counts
- Use actual API token count when available
- Adjust `calculateCreditCost()` for pricing differences

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check existing discussions
- Review the documentation

## Changelog

### v0.1.0 (Initial Release)
- Core streaming chat interface
- Supabase authentication setup
- Token counting and billing system
- Database schema with RLS policies
- Responsive design with Tailwind CSS
- Production-ready code structure

---

**Built with ❤️ for teams building AI products**

Ready to productionize? Check out:
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-to-prod)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
