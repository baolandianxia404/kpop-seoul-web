"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLang } from "@/components/LanguageProvider"

function formatCount(n: number): string {
  if (n === 0) return ""
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
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { count } = await supabase
        .from("user_presence")
        .select("*", { count: "exact", head: true })
        .gte("last_seen", fiveMinAgo)
      setCount(count ?? 0)
    }
    fetch()
    const interval = setInterval(fetch, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (count === null || count === 0) return null

  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-500 font-medium">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
      </span>
      {formatCount(count)} {lang === "zh" ? "颗星星正在旅行" : "stars exploring"}
    </span>
  )
}
