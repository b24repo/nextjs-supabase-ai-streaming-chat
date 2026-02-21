/**
 * Type definitions for the AI Chat MVP application
 */

export interface User {
  id: string
  email: string
  credits: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  tokens_used: number
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  messages?: Message[]
}

export interface ChatRequest {
  message: string
  conversationId?: string
}

export interface ChatResponse {
  conversationId: string
  messageId: string
  content: string
  tokensUsed: number
  creditsRemaining: number
}

export interface StreamMessage {
  type: 'content' | 'tokens' | 'done' | 'error'
  data: string | number | { error: string; creditsRemaining: number }
}

export interface TokenCountResult {
  tokens: number
  creditsRemaining: number
}
