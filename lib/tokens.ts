/**
 * Token counting utilities using js-tiktoken
 * Estimates tokens for billing purposes
 */

import { encoding_for_model } from 'js-tiktoken'

/**
 * Count tokens in a text string
 * Uses GPT-4 encoding as a standard
 */
export function countTokens(text: string): number {
  try {
    const enc = encoding_for_model('gpt-4')
    const tokens = enc.encode(text)
    return tokens.length
  } catch (error) {
    console.error('Error counting tokens:', error)
    // Fallback: estimate 1 token per 4 characters
    return Math.ceil(text.length / 4)
  }
}

/**
 * Calculate credit cost based on tokens
 * Pricing: 1 token = 0.001 credits
 */
export function calculateCreditCost(tokens: number): number {
  return Math.ceil(tokens * 0.001)
}

/**
 * Format tokens for display
 */
export function formatTokens(tokens: number): string {
  if (tokens < 1000) {
    return `${tokens}`
  }
  return `${(tokens / 1000).toFixed(1)}k`
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  return `$${(credits / 100).toFixed(2)}`
}
