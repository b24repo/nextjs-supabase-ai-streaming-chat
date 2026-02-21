/**
 * API Route: /api/chat
 * Handles streaming AI responses with token counting and credit management
 */

import { NextRequest, NextResponse } from 'next/server'
import { countTokens, calculateCreditCost } from '@/lib/tokens'
import { saveMessage, createConversation, updateUserCredits, getConversationHistory, getUserCredits } from '@/lib/supabase'

async function generateAIResponse(userMessage: string, history: any[]): Promise<string> {
  const responses = [
    `I understand you're asking about "${userMessage.substring(0, 30)}...". This MVP demonstrates streaming AI responses with token counting and credit management.`,
  ];
  return responses[0];
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId } = await request.json();
    if (!message || !userId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    
    const credits = await getUserCredits(userId);
    if (credits < 1) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    
    let activeId = conversationId;
    if (!activeId) {
      const c = await createConversation(userId, message.substring(0, 50));
      activeId = c.id;
    }
    
    const history = await getConversationHistory(activeId);
    const userTokens = countTokens(message);
    await saveMessage(activeId, 'user', message, userTokens);
    
    const aiResponse = await generateAIResponse(message, history);
    const aiTokens = countTokens(aiResponse);
    const totalTokens = userTokens + aiTokens;
    const creditsUsed = calculateCreditCost(totalTokens);
    const remaining = await updateUserCredits(userId, creditsUsed);
    await saveMessage(activeId, 'assistant', aiResponse, aiTokens);
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(ctrl) {
        for (let i = 0; i < aiResponse.length; i++) {
          ctrl.enqueue(encoder.encode(JSON.stringify({ type: 'content', data: aiResponse[i] }) + '\\n'));
          await new Promise(r => setTimeout(r, 5));
        }
        ctrl.enqueue(encoder.encode(JSON.stringify({ type: 'done', data: { conversationId: activeId, remaining } }) + '\\n'));
        ctrl.close();
      }
    });
    
    return new NextResponse(stream, { headers: { 'Content-Type': 'application/x-ndjson' } });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
