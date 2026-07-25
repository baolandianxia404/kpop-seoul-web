"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLang } from "@/components/LanguageProvider"

export default function StarTravelers() {
  const { lang } = useLang()
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function fetchCount() {
      try {
        const supabase = createClient()
        const { count: c } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
        if (c && c > 0) setCount(c)
      } catch {
        // Supabase not configured — silently hide
      }
    }
    fetchCount()
  }, [])

  if (!mounted || count === 0) return null

  const text =
    lang === "zh"
      ? `${count}+ 颗星星正在旅行`
      : `${count}+ stars exploring`

  return (
    <span className="text-xs text-gray-400 cursor-default" title="StarTrail travelers">
      🌟 {text}
    </span>
  )
}
