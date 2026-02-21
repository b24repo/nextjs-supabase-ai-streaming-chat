# Next.js + Supabase Streaming AI Chat

Full-stack AI chat application with streaming responses, user auth, and credit system.

## Features

- **Streaming AI Responses**: Real-time token-by-token output via Claude API
- **Supabase Auth**: Email/password authentication with session management
- **Conversation History**: Persisted in Supabase PostgreSQL
- **Credit System**: Token counting per response with usage tracking
- **Responsive UI**: Tailwind CSS with mobile-first design
- **Row-Level Security**: Supabase RLS policies for data isolation
- **TypeScript**: Full type safety throughout

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Server Components
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API with streaming
- **Auth**: Supabase Auth

## Quick Start

```bash
npm install
cp .env.example .env.local
# Add your Supabase + Anthropic keys
npm run dev
```

## Database Setup

Run `supabase_schema.sql` in your Supabase SQL editor to create:
- `profiles` - User profiles with credit balances
- `conversations` - Chat sessions
- `messages` - Individual messages with token counts
- `usage_logs` - Credit usage tracking
- RLS policies for all tables

## Project Structure

```
app/
├── page.tsx              # Main chat UI (420 lines)
├── layout.tsx            # Root layout
└── api/chat/route.ts    # Streaming API (140 lines)
lib/
├── supabase.ts          # Auth + credit ops
└── hooks/useChat.ts     # Custom React hook
supabase_schema.sql       # Full DB schema
```

## Phases

- Phase 1: Streaming chat + auth + credits (THIS MVP)
- Phase 2: Twilio SMS + TTS + image generation
- Phase 3: Stripe subscriptions + billing
- Phase 4: Admin dashboard + QA
