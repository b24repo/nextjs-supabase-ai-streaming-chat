# API Documentation

Complete API reference for the AI Chat MVP application.

## Base URL

```
https://yourdomain.com/api
```

## Authentication

All API requests require authentication via JWT token in the `Authorization` header.

The JWT token is automatically managed by Supabase Auth in the client.

```bash
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### 1. Chat Streaming

**POST** `/api/chat`

Stream an AI response to a user message with real-time token counting.

#### Request

```json
{
  "message": "What is machine learning?",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Request Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User's message (max 2000 chars) |
| `conversationId` | string (UUID) | No | Existing conversation ID; creates new if omitted |
| `userId` | string (UUID) | Yes | Current user ID |

#### Response

Returns NDJSON stream with the following events:

```json
{"type": "content", "data": "I"}
{"type": "content", "data": " "}
{"type": "content", "data": "a"}
...
```

**Response Stream Events:**

| Type | Data | Description |
|------|------|-------------|
| `content` | string | Single character of the response |
| `tokens` | object | Token usage information |
| `done` | object | Final response metadata |
| `error` | object | Error information if request fails |

**Token Info Object:**
```json
{
  "userTokens": 5,
  "aiTokens": 150,
  "totalTokens": 155,
  "creditsUsed": 1
}
```

**Done Object:**
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "creditsRemaining": 49999
}
```

#### Example Request

```bash
curl -X POST https://yourdomain.com/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Hello, how are you?",
    "userId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

#### Example Response

```
{"type":"content","data":"I"}
{"type":"content","data":"'"}
{"type":"content","data":"m"}
{"type":"content","data":" "}
{"type":"content","data":"d"}
{"type":"content","data":"o"}
{"type":"content","data":"i"}
{"type":"content","data":"n"}
{"type":"content","data":"g"}
{"type":"content","data":" "}
{"type":"content","data":"w"}
{"type":"content","data":"e"}
{"type":"content","data":"l"}
{"type":"content","data":"l"}
{"type":"content","data","!"}
{"type":"tokens","data":{"userTokens":5,"aiTokens":15,"totalTokens":20,"creditsUsed":1}}
{"type":"done","data":{"conversationId":"550e8400-e29b-41d4-a716-446655440000","creditsRemaining":49999}}
```

#### Error Responses

**Missing Required Fields:**
```json
{
  "error": "Missing required fields: message, userId"
}
```
Status: `400 Bad Request`

**Insufficient Credits:**
```json
{
  "error": "Insufficient credits. Please purchase more credits to continue."
}
```
Status: `402 Payment Required`

**Server Error:**
```json
{
  "error": "An error occurred processing your request"
}
```
Status: `500 Internal Server Error`

#### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success, stream initiated |
| 400 | Bad request, validation error |
| 402 | Insufficient credits |
| 500 | Server error |

## Data Models

### Message

```typescript
interface Message {
  id: string                    // UUID
  conversation_id: string       // UUID
  role: 'user' | 'assistant'    // Message sender
  content: string               // Message text
  tokens_used: number           // Tokens consumed
  created_at: string            // ISO 8601 timestamp
}
```

### Conversation

```typescript
interface Conversation {
  id: string                    // UUID
  user_id: string               // UUID
  title: string                 // Conversation title
  description?: string          // Optional description
  model: string                 // Model used (e.g., 'gpt-4')
  created_at: string            // ISO 8601 timestamp
  updated_at: string            // ISO 8601 timestamp
  messages?: Message[]          // Message history
}
```

### User

```typescript
interface User {
  id: string                    // UUID
  email: string                 // Email address
  full_name?: string            // User's full name
  avatar_url?: string           // Avatar URL
  credits: number               // Remaining credits in cents
  total_spent: number           // Total credits used
  created_at: string            // ISO 8601 timestamp
  updated_at: string            // ISO 8601 timestamp
}
```

### Credit Transaction

```typescript
interface CreditTransaction {
  id: string                    // UUID
  user_id: string               // UUID
  amount: number                // Credits added (positive) or used (negative)
  reason: string                // Transaction reason
  conversation_id?: string      // Associated conversation UUID
  metadata?: object             // Additional data
  created_at: string            // ISO 8601 timestamp
}
```

## Error Handling

### Error Response Format

All errors return JSON with this structure:

```json
{
  "error": "Human-readable error message",
  "details": {
    "code": "ERROR_CODE",
    "context": {}
  }
}
```

### Common Errors

#### Authentication Error

```json
{
  "error": "Unauthorized"
}
```
Status: `401 Unauthorized`

**Cause:** Missing or invalid JWT token

**Solution:**
1. Check token is present in `Authorization` header
2. Verify token hasn't expired
3. Re-authenticate user if needed

#### Rate Limit Error

```json
{
  "error": "Too many requests. Please wait before sending another message."
}
```
Status: `429 Too Many Requests`

**Cause:** Exceeded rate limit

**Solution:** Wait before sending another request

#### Streaming Timeout

```json
{
  "error": "Request timeout"
}
```
Status: `504 Gateway Timeout`

**Cause:** Response generation took too long

**Solution:** Try again or reduce context window

## Rate Limiting

API rate limits are applied per user:

- **Chat endpoint:** 60 requests/minute
- **Burst limit:** 100 requests/minute for authenticated users
- **Monthly limit:** 10,000 requests/month

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640000000
```

## Token Counting

### Algorithm

Tokens are counted using `js-tiktoken` with GPT-4 encoding.

### Pricing

| Metric | Value |
|--------|-------|
| Cost per 1000 tokens | 1 credit |
| Cost per 1 token | 0.001 credits |
| Minimum charge | 1 credit |
| 1 credit = | $0.01 (1 cent) |

### Example

For a 155-token exchange:
- Credits used: 1 (rounded up from 0.155)
- Cost: $0.01

## Streaming Details

### NDJSON Format

Responses use Newline Delimited JSON (NDJSON):
- One JSON object per line
- Each line terminated with `\n`
- Suitable for streaming/parsing

### Client-Side Parsing

```typescript
async function parseStream(response: Response) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue
      const event = JSON.parse(line)
      handleStreamEvent(event)
    }
  }
}
```

### Connection Requirements

- **Keep-alive:** Recommended to maintain connection
- **Timeout:** Set client timeout > 60 seconds for large responses
- **Reconnection:** Implement exponential backoff for retries

## Examples

### JavaScript/TypeScript

```typescript
async function chatWithAI(message: string, userId: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getJWTToken()}`,
    },
    body: JSON.stringify({
      message,
      userId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  let fullResponse = ''
  let tokens = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })
    const lines = text.split('\n').filter(l => l.trim())

    for (const line of lines) {
      const event = JSON.parse(line)

      if (event.type === 'content') {
        fullResponse += event.data
        console.log(event.data)
      } else if (event.type === 'tokens') {
        tokens = event.data
      } else if (event.type === 'done') {
        console.log('Response complete:', fullResponse)
        console.log('Tokens used:', tokens.totalTokens)
        console.log('Credits remaining:', event.data.creditsRemaining)
      }
    }
  }

  return { response: fullResponse, tokens }
}
```

### Python

```python
import requests
import json

def chat_with_ai(message: str, user_id: str, jwt_token: str):
    url = "https://yourdomain.com/api/chat"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {jwt_token}",
    }
    data = {
        "message": message,
        "userId": user_id,
    }

    response = requests.post(url, headers=headers, json=data, stream=True)

    if response.status_code != 200:
        error = response.json()
        raise Exception(error["error"])

    full_response = ""
    for line in response.iter_lines():
        if not line:
            continue

        event = json.loads(line)

        if event["type"] == "content":
            full_response += event["data"]
            print(event["data"], end="", flush=True)
        elif event["type"] == "tokens":
            tokens = event["data"]
        elif event["type"] == "done":
            print(f"\nCredits remaining: {event['data']['creditsRemaining']}")

    return full_response
```

### cURL

```bash
curl -X POST https://yourdomain.com/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "message": "Hello!",
    "userId": "550e8400-e29b-41d4-a716-446655440001"
  }' \
  --no-buffer
```

## Webhooks (Future)

### Conversation Created

Webhook sent when a new conversation is created:

```json
{
  "event": "conversation.created",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "What is machine learning?",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

### Message Created

Webhook sent when a message is created:

```json
{
  "event": "message.created",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "assistant",
    "tokens_used": 150,
    "created_at": "2024-01-01T12:00:05Z"
  }
}
```

## Versioning

Current API Version: **1.0.0**

Breaking changes will increment the major version number.

All v1.x versions are backward compatible.

## Changelog

### v1.0.0 (2024-01-01)

- Initial API release
- Chat streaming endpoint
- Token counting
- Credit management
- Conversation history

## Support

For API support:
- Check API logs in Vercel dashboard
- Review error messages carefully
- Enable debug logging
- Contact support with request ID from `X-Request-ID` header

## Rate Limits & Quotas

### Free Tier
- 100 API calls/day
- 1000 tokens/day
- Max 10 conversations

### Pro Tier
- Unlimited API calls
- 1,000,000 tokens/month
- Unlimited conversations

### Enterprise
- Custom limits
- Dedicated support
- SLA guarantee

---

**Last Updated:** 2024-01-01
**API Version:** 1.0.0
