import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error("Error getting session:", error.message)
    return null
  }

  return data.session
}

export async function signInAsGuest() {
  const { data, error } = await supabase.auth.signInAnonymously()

  if (error) {
    console.error("Anonymous sign-in failed:", error.message)
    return { success: false, error: error.message, session: null }
  }

  return { success: true, error: null, session: data.session }
}

export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })

  if (error) {
    console.error("Email sign-in failed:", error.message)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Sign-out failed:", error.message)
    return false
  }

  return true
}

/* compatibility helper for older files still importing it */
export async function ensureGuestSession() {
  const existingSession = await getCurrentSession()
  if (existingSession) return true

  const result = await signInAsGuest()
  return !!result.session
}