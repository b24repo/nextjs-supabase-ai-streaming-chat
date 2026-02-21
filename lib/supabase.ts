/**
 * Supabase client configuration
 * Handles authentication and database operations
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Supabase client for client-side operations (with RLS)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Server-side Supabase client with service role
 * Only use in API routes, never expose to client
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

/**
 * Get current user session
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get user credits
 */
export async function getUserCredits(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user credits:', error)
    return 0
  }

  return data?.credits || 0
}

/**
 * Update user credits
 */
export async function updateUserCredits(userId: string, creditsUsed: number) {
  const { data: userData, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single()

  if (fetchError) {
    console.error('Error fetching credits:', fetchError)
    throw new Error('Failed to fetch user credits')
  }

  const newCredits = Math.max(0, userData.credits - creditsUsed)

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ credits: newCredits, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (updateError) {
    console.error('Error updating credits:', updateError)
    throw new Error('Failed to update user credits')
  }

  return newCredits
}

/**
 * Create a new conversation
 */
export async function createConversation(userId: string, title: string) {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({
      user_id: userId,
      title: title || 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    throw new Error('Failed to create conversation')
  }

  return data
}

/**
 * Save message to database
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  tokensUsed: number
) {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      tokens_used: tokensUsed,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving message:', error)
    throw new Error('Failed to save message')
  }

  return data
}

/**
 * Get conversation history
 */
export async function getConversationHistory(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching conversation history:', error)
    return []
  }

  return data || []
}
