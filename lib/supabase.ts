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

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserCredits(userId: string) {
  const { data, error } = await supabase.from('users').select('credits').eq('id', userId).single()
  if (error) return 0
  return data?.credits || 0
}

export async function updateUserCredits(userId: string, creditsUsed: number) {
  const { data: userData } = await supabaseAdmin.from('users').select('credits').eq('id', userId).single()
  const newCredits = Math.max(0, (userData?.credits || 0) - creditsUsed)
  await supabaseAdmin.from('users').update({ credits: newCredits }).eq('id', userId)
  return newCredits
}

export async function createConversation(userId: string, title: string) {
  const { data } = await supabaseAdmin.from('conversations').insert({ user_id: userId, title }).select().single()
  return data
}

export async function saveMessage(conversationId: string, role: 'user' | 'assistant', content: string, tokensUsed: number) {
  const { data } = await supabaseAdmin.from('messages').insert({ conversation_id: conversationId, role, content, tokens_used: tokensUsed }).select().single()
  return data
}

export async function getConversationHistory(conversationId: string) {
  const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true })
  return data || []
}
