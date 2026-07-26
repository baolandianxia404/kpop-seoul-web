"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClient } from "@/lib/supabase/client"

export default function PresenceTracker() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const heartbeat = async () => {
      const supabase = createClient()
      await supabase.from("user_presence").upsert({
        user_id: user.id,
        last_seen: new Date().toISOString(),
      })
    }

    heartbeat()
    const interval = setInterval(heartbeat, 60_000)
    return () => clearInterval(interval)
  }, [user])

  return null
}
