/**
 * Custom hook for managing chat state and operations
 * Handles message sending, streaming, and local state management
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { Message, TokenInfo } from '@/lib/types'

interface UseChatOptions {
  initialMessages?: Message[]
  userId: string
}

export function useChat({ initialMessages = [], userId }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string>('')
  const [streamingMessage, setStreamingMessage] = useState('')
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  // Send message and handle streaming
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setError(null)
      setIsLoading(true)
      setStreamingMessage('')

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')

      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            conversationId,
            userId,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to get response')
        }

        if (!response.body) {
          throw new Error('No response body')
        }

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

            try {
              const data = JSON.parse(line)

              if (data.type === 'content') {
                setStreamingMessage((prev) => prev + data.data)
              } else if (data.type === 'tokens') {
                setTokenInfo(data.data)
              } else if (data.type === 'done') {
                setConversationId(data.data.conversationId)
                const assistantMessage: Message = {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: streamingMessage,
                  tokens: tokenInfo?.totalTokens,
                  timestamp: new Date(),
                }
                setMessages((prev) => [...prev, assistantMessage])
                setStreamingMessage('')
              }
            } catch (e) {
              console.error('Error parsing stream:', e)
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setError(error.message)
        }
        setStreamingMessage('')
      } finally {
        setIsLoading(false)
      }
    },
    [conversationId, userId, tokenInfo, streamingMessage]
  )

  // Cancel ongoing request
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }, [])

  // Clear chat
  const clear = useCallback(() => {
    setMessages([])
    setInput('')
    setError(null)
    setConversationId('')
    setStreamingMessage('')
    setTokenInfo(null)
  }, [])

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    conversationId,
    streamingMessage,
    tokenInfo,
    sendMessage,
    cancel,
    clear,
  }
}
