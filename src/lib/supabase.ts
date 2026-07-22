import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  // Surfaced in the browser console during development if env vars are missing.
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY')
}

export const supabase = createClient(url, key, {
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
