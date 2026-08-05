# Supabase Edge Functions

## ai-tutor

Powers the AI conversation practice, hints, and scoring on the "ฝึกสนทนา" screen
(`src/pages/AIConversationPage.tsx` → `callTutor` in `src/lib/data.ts`).

This is a **reference implementation** (Gemini). If you already run an `ai-tutor`
function elsewhere, keep yours — this one exists so the endpoint the app depends
on is version-controlled and reviewable.

### Deploy

```bash
# one-time: set the model key as a function secret
supabase secrets set GEMINI_API_KEY=YOUR_GOOGLE_AI_STUDIO_KEY
# optional: choose a model (defaults to gemini-1.5-flash)
supabase secrets set GEMINI_MODEL=gemini-1.5-flash

supabase functions deploy ai-tutor
```

### Contract

Request body:
```json
{ "mode": "chat" | "hint" | "score",
  "messages": [{ "role": "user" | "assistant", "content": "..." }],
  "systemInstruction": "..." }
```

The `systemInstruction` (built by the app) already tells the model to reply with
the exact JSON shape the UI expects, so the function just forwards it to Gemini
with `responseMimeType: application/json` and returns the parsed result.
