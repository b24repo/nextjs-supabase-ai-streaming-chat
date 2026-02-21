'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, LogOut, Zap, MessageSquare, AlertCircle } from 'lucide-react'
import { formatCredits, formatTokens } from '@/lib/tokens'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  tokens?: number
  timestamp: Date
}

interface TokenInfo {
  userTokens: number
  aiTokens: number
  totalTokens: number
  creditsUsed: number
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [credits, setCredits] = useState(50000) // Default demo credits: $500
  const [conversationId, setConversationId] = useState<string>('')
  const [userId] = useState('demo-user-' + Math.random().toString(36).substring(7))
  const [streamingMessage, setStreamingMessage] = useState('')
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    if (credits < 1) {
      setError('Insufficient credits. Please purchase more to continue.')
      return
    }

    setError(null)

    // Add user message to state
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setStreamingMessage('')
    setTokenInfo(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationId,
          userId,
        }),
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
              const newCredits = credits - data.data.creditsUsed
              setCredits(newCredits)
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
            } else if (data.type === 'error') {
              setError(data.data.error)
            }
          } catch (e) {
            console.error('Error parsing stream:', e)
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      setError(errorMessage)
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as any)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">AI Chat MVP</h1>
              <p className="text-xs text-slate-500">Production-ready streaming chat</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Credits Display */}
            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 border border-blue-200">
              <Zap className="h-5 w-5 text-amber-500" />
              <div className="text-right">
                <p className="text-xs text-slate-600">Credits</p>
                <p className="text-sm font-bold text-slate-900">
                  {formatCredits(credits)}
                </p>
              </div>
            </div>

            {/* User ID Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-slate-600 font-mono">{userId.substring(0, 12)}...</span>
            </div>

            {/* Demo Mode Indicator */}
            <button
              className="flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 transition-colors"
              title="Demo mode - click to reset"
              onClick={() => {
                setMessages([])
                setConversationId('')
                setCredits(50000)
                setError(null)
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && streamingMessage === '' && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Welcome to AI Chat</h2>
                  <p className="text-slate-600 mt-2">Start a conversation to see the power of streaming AI</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 max-w-2xl">
                  <div className="rounded-lg bg-white p-4 border border-slate-200 text-left hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setInput('How does streaming AI work?')}>
                    <p className="font-medium text-slate-900 text-sm">What is this?</p>
                    <p className="text-xs text-slate-600 mt-1">Learn about streaming AI</p>
                  </div>
                  <div className="rounded-lg bg-white p-4 border border-slate-200 text-left hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setInput('What features does this MVP have?')}>
                    <p className="font-medium text-slate-900 text-sm">Features</p>
                    <p className="text-xs text-slate-600 mt-1">Explore the capabilities</p>
                  </div>
                  <div className="rounded-lg bg-white p-4 border border-slate-200 text-left hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setInput('How can I deploy this?')}>
                    <p className="font-medium text-slate-900 text-sm">Deployment</p>
                    <p className="text-xs text-slate-600 mt-1">Get it running in production</p>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`message-animate flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                {message.tokens && message.role === 'assistant' && (
                  <p className="text-xs mt-2 opacity-70">
                    {formatTokens(message.tokens)} tokens
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Streaming Message */}
          {streamingMessage && (
            <div className="message-animate flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center animate-pulse">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-2xl rounded-lg px-4 py-3 bg-white text-slate-900 border border-slate-200">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{streamingMessage}</p>
                <div className="typing-indicator mt-2">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {/* Token Info */}
          {tokenInfo && (
            <div className="flex justify-center">
              <div className="text-xs text-slate-600 bg-slate-100 rounded-full px-3 py-1 border border-slate-200">
                {formatTokens(tokenInfo.totalTokens)} tokens • {formatCredits(tokenInfo.creditsUsed)} used
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex gap-3 justify-center">
              <div className="max-w-2xl rounded-lg px-4 py-3 bg-red-50 text-red-900 border border-red-200 flex gap-2 items-start">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white/80 backdrop-blur-sm p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto space-y-2">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none max-h-32"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || credits < 1}
                className={`flex-shrink-0 rounded-lg px-6 py-3 font-medium transition-all duration-200 flex items-center gap-2 ${
                  isLoading || !input.trim() || credits < 1
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                }`}
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 text-center">
              {credits < 100 && credits > 0 && (
                <span className="text-amber-600 font-medium">
                  Low on credits - only {formatCredits(credits)} remaining
                </span>
              )}
              {credits < 1 && (
                <span className="text-red-600 font-medium">
                  No credits available. Reset the demo to continue.
                </span>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
