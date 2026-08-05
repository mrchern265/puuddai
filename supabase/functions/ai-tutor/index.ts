// Supabase Edge Function: ai-tutor
// Backs the AI conversation / hint / scoring used by src/pages/AIConversationPage.tsx
// (called via `supabase.functions.invoke('ai-tutor', ...)` in src/lib/data.ts).
//
// Contract (matches the app):
//   Request  body: { mode: 'chat' | 'hint' | 'score', messages: {role,content}[], systemInstruction: string }
//   Response body: the JSON object the systemInstruction asks the model to produce, e.g.
//     chat  -> { "reply": "...", "thai": "..." }
//     hint  -> { "hint": "..." }
//     score -> { "taskSuccess": bool, "fluencyScore": 0-100, "corrections": [...], "encouragementTh": "..." }
//
// Deploy:  supabase functions deploy ai-tutor
// Secret:  supabase secrets set GEMINI_API_KEY=xxxx   (optional: GEMINI_MODEL=gemini-1.5-flash)

interface TutorMessage {
  role: 'user' | 'assistant'
  content: string
}

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { mode, messages, systemInstruction } = (await req.json()) as {
      mode?: string
      messages?: TutorMessage[]
      systemInstruction?: string
    }

    const key = Deno.env.get('GEMINI_API_KEY')
    if (!key) return json({ error: 'Missing GEMINI_API_KEY secret' }, 500)
    const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-1.5-flash'

    const contents = (messages ?? []).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const body = {
      system_instruction: { parts: [{ text: systemInstruction ?? '' }] },
      contents,
      generationConfig: {
        temperature: mode === 'score' ? 0.2 : 0.7,
        responseMimeType: 'application/json',
      },
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) },
    )
    const data = await res.json()
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'

    try {
      return json(JSON.parse(text))
    } catch {
      // Model didn't return clean JSON — fall back to a plain chat reply.
      return json({ reply: text, thai: '' })
    }
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
