"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/types"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fanGroupId: string, displayName?: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseClient] = useState(() => createClient())

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    if (data) setProfile(data as UserProfile)
  }, [supabaseClient])

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else setProfile(null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabaseClient, fetchProfile])

  const signUp = async (email: string, password: string, fanGroupId: string, displayName?: string) => {
    const { data, error } = await supabaseClient.auth.signUp({ email, password })
    if (error) return { error: error.message }

    if (data.user) {
      const { error: profileError } = await supabaseClient.from("profiles").insert({
        id: data.user.id,
        email,
        display_name: displayName || email.split("@")[0],
        fan_group_id: fanGroupId,
      })
      if (profileError) return { error: profileError.message }
      await fetchProfile(data.user.id)
    }
    return {}
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  const signOut = async () => {
    await supabaseClient.auth.signOut()
    setProfile(null)
    setUser(null)
    setSession(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
