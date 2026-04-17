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
    return null
  }

  return data.session
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Sign-out failed:", error.message)
    return false
  }

  return true
}

/* compatibility helper for older files like UseTasks.tsx */
export async function ensureGuestSession() {
  const session = await getCurrentSession()
  if (session) return true

  const newSession = await signInAsGuest()
  return !!newSession
}