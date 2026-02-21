/**
 * API Route: /api/chat
 * Handles streaming AI responses with token counting and credit management
 */

import { NextRequest, NextResponse } from 'next/server'
import { countTokens, calculateCreditCost } from '@/lib/tokens'
import { saveMessage, createConversation, updateUserCredits, getConversationHistory, getUserCredits } from '@/lib/supabase'

// Placeholder for streaming response generation
// In production, integrate with OpenAI, Anthropic Claude, or another LLM provider
async function generateAIResponse(
  userMessage: string,
  conversationHistory: any[]
): Promise<string> {
  // This is a demo implementation
  // Replace with actual API calls to your chosen LLM provider

  // For demonstration, we'll return a mock response
  // In production, use the Vercel AI SDK or direct API calls:
  // const response = await openai.chat.completions.create({
  //   model: 'gpt-4',
  //   messages: [...conversationHistory, { role: 'user', content: userMessage }],
  //   stream: true,
  // })

  const mockResponses = [
    `I understand you're asking about "${userMessage.substring(0, 30)}...". That's an interesting question! In production, this would stream a real AI response from OpenAI's GPT-4, Anthropic's Claude, or another LLM. The streaming feature allows users to see responses appear character-by-character, creating a more engaging experience. The backend is using ReadableStream for efficient streaming and counting tokens for billing purposes.`,
    `Thanks for that question about "${userMessage.substring(0, 30)}...". This MVP demonstrates a production-ready chat interface with several key features: real-time streaming responses, token counting for accurate billing, conversation history persistence in Supabase, and a polished UI built with Tailwind CSS. The architecture uses Next.js API routes for the backend and React for the frontend, making it scalable and maintainable.`,
    `Great question regarding "${userMessage.substring(0, 30)}...". This AI Chat MVP showcases best practices in full-stack development. The frontend uses React hooks for state management, the backend streams responses efficiently, and Supabase handles authentication and data persistence. For production use, you'd integrate this with your chosen LLM provider (OpenAI, Anthropic, Cohere, etc.) using either their native APIs or the Vercel AI SDK for easier integration.`,
  ]

  const randomIndex = Math.floor(Math.random() * mockResponses.length)
  return mockResponses[randomIndex]
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId } = await request.json()

    // Validate request
    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, userId' },
        { status: 400 }
      )
    }

    // Check user credits
    const userCredits = await getUserCredits(userId)
    if (userCredits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please purchase more credits to continue.' },
        { status: 402 }
      )
    }

    // Create conversation if needed
    let activeConversationId = conversationId
    if (!activeConversationId) {
      const title = message.substring(0, 50) + (message.length > 50 ? '...' : '')
      const newConversation = await createConversation(userId, title)
      activeConversationId = newConversation.id
    }

    // Get conversation history
    const history = await getConversationHistory(activeConversationId)

    // Save user message
    const userTokens = countTokens(message)
    await saveMessage(activeConversationId, 'user', message, userTokens)

    // Generate AI response
    const aiResponse = await generateAIResponse(message, history)
    const aiTokens = countTokens(aiResponse)

    // Calculate total tokens and credits used
    const totalTokens = userTokens + aiTokens
    const creditsUsed = calculateCreditCost(totalTokens)

    // Update user credits
    const creditsRemaining = await updateUserCredits(userId, creditsUsed)

    // Save assistant message
    await saveMessage(activeConversationId, 'assistant', aiResponse, aiTokens)

    // Stream the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the response character by character
          for (let i = 0; i < aiResponse.length; i++) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: 'content',
                  data: aiResponse[i],
                }) + '\n'
              )
            )
            // Add slight delay for typewriter effect
            await new Promise((resolve) => setTimeout(resolve, 5))
          }

          // Send token information
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'tokens',
                data: { userTokens, aiTokens, totalTokens, creditsUsed },
              }) + '\n'
            )
          )

          // Send completion
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'done',
                data: {
                  conversationId: activeConversationId,
                  creditsRemaining,
                },
              }) + '\n'
            )
          )

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'An error occurred processing your request',
      },
      { status: 500 }
    )
  }
}
