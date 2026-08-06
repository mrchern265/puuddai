import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// True only when both build-time env vars were actually inlined. If a deploy
// forgets to set them, createClient(undefined, …) throws at import time and the
// whole app white-screens before React even mounts — so we guard against it.
export const supabaseConfigured = Boolean(url && key)

if (!supabaseConfigured) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY')
}

// Fall back to a syntactically valid placeholder so the import never throws.
// When env is missing the app shows a readable "not configured" screen instead
// of a blank page (see main.tsx), and no real requests are ever made.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-key',
  {
  auth: {
    // Keep the user logged in across reloads and refresh tokens automatically
    // so the session does not silently expire while they are using the app.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Pin storage to localStorage explicitly. Without this the client can fall
    // back to in-memory storage in some browsers/build setups, which drops the
    // session on every reload (the "logged out on every fresh open" symptom).
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'puuddai-auth',
  },
})
