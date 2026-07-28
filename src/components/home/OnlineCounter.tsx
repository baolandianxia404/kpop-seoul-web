"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLang } from "@/components/LanguageProvider"

function formatCount(n: number): string {
  if (n <= 10) return "10+"
  if (n <= 20) return "20+"
  if (n <= 50) return "50+"
  if (n <= 100) return "100+"
  return "100+"
}

export default function OnlineCounter() {
  const { lang } = useLang()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      // Try online users first
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { count: online } = await supabase
        .from("user_presence")
        .select("*", { count: "exact", head: true })
        .gte("last_seen", fiveMinAgo)

      if (online && online > 0) {
        setCount(online)
        return
      }

      // Fallback: total registered users
      const { count: total } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
      setCount(total ?? 0)
    }
    fetch()
    const interval = setInterval(fetch, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (count === null || count === 0) return null

  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
      ✨ {formatCount(count)} {lang === "zh" ? "星星正在旅行" : "stars exploring"}
    </span>
  )
}
