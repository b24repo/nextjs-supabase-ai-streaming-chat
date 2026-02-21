# Quick Reference Card

Fast lookup guide for common tasks and commands.

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Essential Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push database changes to Supabase |
| `npm run db:pull` | Pull database changes from Supabase |

## File Locations

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main chat UI component |
| `app/api/chat/route.ts` | Chat streaming API endpoint |
| `lib/supabase.ts` | Supabase client & utilities |
| `lib/tokens.ts` | Token counting utilities |
| `lib/types.ts` | TypeScript type definitions |
| `supabase_schema.sql` | Database schema |
| `.env.local` | Local environment variables |

## Key URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | Local app |
| `https://supabase.com/dashboard` | Supabase console |
| `https://platform.openai.com` | OpenAI dashboard |
| `https://vercel.com/dashboard` | Vercel dashboard |

## Environment Variables Needed

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
OPENAI_API_KEY=sk-<your-key>
```

## Common Tasks

### Add a Message to Database

```typescript
import { saveMessage } from '@/lib/supabase'

await saveMessage(conversationId, 'user', 'Hello!', 5)
```

### Count Tokens

```typescript
import { countTokens, formatTokens } from '@/lib/tokens'

const tokens = countTokens('Hello world')
console.log(formatTokens(tokens)) // "11"
```

### Get User Credits

```typescript
import { getUserCredits } from '@/lib/supabase'

const credits = await getUserCredits(userId)
console.log(credits) // 50000 (cents)
```

### Deduct Credits

```typescript
import { updateUserCredits } from '@/lib/supabase'

const remaining = await updateUserCredits(userId, creditsUsed)
```

## Database Queries

### Get All Messages in Conversation

```sql
SELECT * FROM messages
WHERE conversation_id = '<uuid>'
ORDER BY created_at;
```

### Get User's Conversations

```sql
SELECT * FROM conversations
WHERE user_id = '<uuid>'
ORDER BY created_at DESC;
```

### Check User Credits

```sql
SELECT id, email, credits FROM users
WHERE id = '<uuid>';
```

### Update User Credits

```sql
UPDATE users
SET credits = credits - 100, updated_at = NOW()
WHERE id = '<uuid>';
```

### See Credit Transactions

```sql
SELECT * FROM credit_transactions
WHERE user_id = '<uuid>'
ORDER BY created_at DESC;
```

## API Endpoint

### POST /api/chat

**Request:**
```json
{
  "message": "Hello!",
  "conversationId": "<uuid-or-null>",
  "userId": "<uuid>"
}
```

**Response Stream:**
```
{"type":"content","data":"H"}
{"type":"content","data":"i"}
{"type":"tokens","data":{"totalTokens":20,"creditsUsed":1}}
{"type":"done","data":{"conversationId":"<uuid>","creditsRemaining":49999}}
```

## Debugging

### Enable Logs

In browser DevTools:
1. Open Network tab
2. Find `/api/chat` request
3. Check Response tab
4. Look for streaming events

### Check Database

```sql
-- Supabase SQL Editor
SELECT * FROM messages LIMIT 10;
SELECT * FROM conversations LIMIT 10;
```

### Test Streaming

```bash
curl -N http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","userId":"demo"}'
```

## TypeScript Cheat Sheet

### Message Type
```typescript
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  tokens?: number
  timestamp: Date
}
```

### Conversation Type
```typescript
interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
}
```

### User Type
```typescript
interface User {
  id: string
  email: string
  credits: number
  created_at: string
}
```

## Styling

### Tailwind Classes

| Class | Purpose |
|-------|---------|
| `text-primary-600` | Primary text color |
| `bg-gradient-to-br` | Gradient background |
| `rounded-lg` | Rounded corners |
| `shadow-sm` | Subtle shadow |
| `animate-pulse` | Pulsing animation |

### Custom CSS

```css
/* In app/globals.css */
.message-animate {
  animation: slideUp 0.3s ease-out;
}

.typing-indicator span {
  animation: typing 1.4s infinite;
}
```

## React Hooks Used

| Hook | Usage |
|------|-------|
| `useState` | State management |
| `useRef` | DOM references (messages list) |
| `useEffect` | Side effects (auto-scroll) |
| `useCallback` | Memoized functions |

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot find module" | Dependencies not installed | `npm install` |
| "env variables undefined" | Missing `.env.local` | `cp .env.example .env.local` |
| "RLS policy violation" | Not authenticated | Check user ID |
| "Insufficient credits" | User out of credits | Increase demo credits |
| Streaming cuts off | Network timeout | Check API response |

## Performance Tips

- Messages stream in real-time (no artificial delays)
- Token counting is client-side cached
- Database indexes on frequently queried columns
- Use `shouldComponentUpdate` for large message lists
- Lazy load message history

## Security Checklist

- [ ] Never commit `.env.local`
- [ ] Never expose service role key
- [ ] Always use HTTPS in production
- [ ] Validate input on backend
- [ ] Rate limit API endpoints
- [ ] Enable RLS on all tables
- [ ] Keep dependencies updated

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] All env vars set in Vercel
- [ ] Database schema applied
- [ ] API keys are valid
- [ ] Build succeeds locally
- [ ] Error handling in place
- [ ] Monitoring configured
- [ ] Backups enabled

## Resources

**Documentation:**
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Docs](https://react.dev)

**Tools:**
- [VS Code](https://code.visualstudio.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Postman](https://www.postman.com/)
- [Vercel CLI](https://vercel.com/docs/cli)

## Quick Links

- **Main Docs:** [README.md](./README.md)
- **Setup Guide:** [SETUP.md](./SETUP.md)
- **API Docs:** [API.md](./API.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Last Updated:** 2024-01-01
**Version:** 1.0.0

Print this page for quick reference while developing!
