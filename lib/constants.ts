/**
 * Application constants
 */

export const APP_NAME = 'AI Chat MVP'
export const APP_DESCRIPTION = 'Production-ready streaming AI chat application'

// Credit and Pricing
export const DEFAULT_CREDITS = 50000 // $500 in cents
export const CREDITS_PER_1K_TOKENS = 1 // 1 credit per 1000 tokens
export const MIN_CREDIT_CHARGE = 1

// Token Limits
export const MAX_CONTEXT_TOKENS = 8000 // For conversation history
export const MAX_MESSAGE_TOKENS = 2000

// Rate Limiting
export const RATE_LIMIT_REQUESTS_PER_MINUTE = 60
export const RATE_LIMIT_REQUESTS_PER_HOUR = 1000

// UI Constants
export const MESSAGE_ANIMATION_DELAY = 5 // ms between characters
export const SCROLL_BEHAVIOR = 'smooth' as const
export const TOAST_DURATION = 3000 // ms

// Model Configuration
export const SUPPORTED_MODELS = [
  { id: 'gpt-4', name: 'GPT-4', costMultiplier: 2 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', costMultiplier: 1 },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', costMultiplier: 1.5 },
] as const

export const DEFAULT_MODEL = 'gpt-4'

// System Prompts
export const SYSTEM_PROMPT = `You are a helpful, professional AI assistant. You provide clear, accurate, and concise responses. You maintain context throughout the conversation and adapt your communication style to the user's needs.`

// Error Messages
export const ERROR_MESSAGES = {
  INSUFFICIENT_CREDITS: 'You have insufficient credits to send this message.',
  NETWORK_ERROR: 'A network error occurred. Please check your connection and try again.',
  SERVER_ERROR: 'An server error occurred. Please try again later.',
  INVALID_MESSAGE: 'Your message is empty or too long.',
  RATE_LIMITED: 'You are sending messages too quickly. Please wait a moment and try again.',
  AUTH_REQUIRED: 'You must be logged in to use the chat.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  CREDITS_PURCHASED: 'Credits purchased successfully!',
  MESSAGE_SENT: 'Message sent.',
} as const
