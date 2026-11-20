import { NextResponse } from 'next/server';
import { MEDICAL_SAFETY_SYSTEM_PROMPT, containsEmergencyKeywords } from '@/lib/ai/safety';
import { AI_TOOLS, executeAiTool } from '@/lib/ai/tools';
import { CLINIC_INFO } from '@/lib/constants';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  name?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userMessages: ChatMessage[] = body.messages || [];

    if (!Array.isArray(userMessages) || userMessages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
    }

    const latestUserMsg = [...userMessages].reverse().find((m) => m.role === 'user')?.content || '';

    // 1. Immediate Medical Emergency Screening
    if (containsEmergencyKeywords(latestUserMsg)) {
      return NextResponse.json({
        reply:
          '⚠️ Emergency Medical Notice: If you or someone you know is experiencing severe acute symptoms (such as severe chest pain, breathing difficulty, sudden weakness, or heavy bleeding), please contact local emergency services or visit the nearest hospital emergency department immediately. VSHMA consultations are scheduled elective visits and cannot handle emergency conditions.',
        emergency: true,
      });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // 2. If OpenAI key is not configured, run local intent fallback
    if (!openaiApiKey || openaiApiKey === 'your_openai_api_key' || openaiApiKey.startsWith('sk-mock')) {
      const fallbackReply = await handleLocalFallbackIntent(latestUserMsg);
      return NextResponse.json({ reply: fallbackReply, isMock: true });
    }

    // 3. Server-side OpenAI API Execution
    const messagesToSend: ChatMessage[] = [
      { role: 'system', content: MEDICAL_SAFETY_SYSTEM_PROMPT },
      ...userMessages.slice(-10), // keep context window compact
    ];

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messagesToSend,
        tools: AI_TOOLS,
        tool_choice: 'auto',
        temperature: 0.4,
      }),
    });

    if (!openAiResponse.ok) {
      const errData = await openAiResponse.json().catch(() => ({}));
      console.error('[OpenAI Error]', errData);
      const fallbackReply = await handleLocalFallbackIntent(latestUserMsg);
      return NextResponse.json({ reply: fallbackReply, isFallback: true });
    }

    const data = await openAiResponse.json();
    const assistantMessage = data.choices?.[0]?.message;

    // 4. Handle Function / Tool Calls
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      const fnName = toolCall.function.name;
      let fnArgs: Record<string, unknown> = {};

      try {
        fnArgs = JSON.parse(toolCall.function.arguments || '{}');
      } catch {
        fnArgs = {};
      }

      const toolResult = await executeAiTool(fnName, fnArgs);

      // Send tool response back to OpenAI for natural language reply
      const followUpMessages = [
        ...messagesToSend,
        assistantMessage,
        {
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        },
      ];

      const followUpRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: followUpMessages,
          temperature: 0.4,
        }),
      });

      if (followUpRes.ok) {
        const followUpData = await followUpRes.json();
        const finalReply = followUpData.choices?.[0]?.message?.content || '';
        return NextResponse.json({ reply: finalReply, toolUsed: fnName, toolResult });
      }
    }

    const reply = assistantMessage?.content || 'How may I assist you with VSHMA Clinic services today?';
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Chat API Exception]', msg);
    return NextResponse.json(
      { reply: 'I am here to help you learn about VSHMA Clinic or book a consultation. How may I assist?' },
      { status: 200 }
    );
  }
}

// High-quality local intent fallback when OpenAI key is not plugged in
async function handleLocalFallbackIntent(query: string): Promise<string> {
  const lower = query.toLowerCase();

  if (lower.includes('book') || lower.includes('appointment') || lower.includes('schedule') || lower.includes('consultation')) {
    return `To schedule an appointment with Dr. Chihnitha Reddy T (BHMS), you can fill out our online booking form on the [Schedule Consultation](/book) page. Once submitted, your booking reference is created immediately. Would you like me to guide you through the details?`;
  }

  if (lower.includes('timing') || lower.includes('time') || lower.includes('hours') || lower.includes('open')) {
    const hours = (await executeAiTool('get_clinic_hours', {})) as Record<string, string>;
    return `VSHMA Clinic is open Monday through Saturday strictly by prior appointment.\n\nConsultation time windows:\n• Morning (9 AM – 12 PM)\n• Afternoon (12 PM – 3 PM)\n• Evening (3 PM – 6 PM)\nSunday is closed.`;
  }

  if (lower.includes('where') || lower.includes('location') || lower.includes('address')) {
    return `VSHMA Homeopathy Clinic is located in Bengaluru, Karnataka, India. We conduct in-person consultations in Bengaluru as well as virtual video appointments for patients across India and overseas.`;
  }

  if (lower.includes('doctor') || lower.includes('chihnitha') || lower.includes('qualification') || lower.includes('who')) {
    return `Our lead doctor is Dr. Chihnitha Reddy T. She holds a Bachelor of Homeopathic Medicine and Surgery (BHMS) and has dedicated her practice to classical constitutional homeopathy, characterized by deep, unhurried listening and individualized remedies.`;
  }

  if (lower.includes('human') || lower.includes('contact') || lower.includes('phone') || lower.includes('whatsapp') || lower.includes('talk to')) {
    return `You can connect directly with Dr. Chihnitha and our clinic reception via WhatsApp at +91 ${CLINIC_INFO.phone} or email us at ${CLINIC_INFO.email || 'care@vshma.in'}. We are glad to help!`;
  }

  return `Welcome to VSHMA Clinic! I can help you learn about our consultation options, check clinic timings, understand the doctor's approach, or guide you in booking an appointment. How can I assist you today?`;
}
