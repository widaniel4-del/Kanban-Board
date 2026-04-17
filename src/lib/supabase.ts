import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function ensureGuestSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error("Error getting session:", error.message)
    return false
  }

  if (data.session) return true

  const { error: signInError } = await supabase.auth.signInAnonymously()

  if (signInError) {
    console.error("Anonymous sign-in failed:", signInError.message)
    return false
  }

  return true
}