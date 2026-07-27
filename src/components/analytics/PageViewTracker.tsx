"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.from("page_views").insert({ path: pathname }).then(
      ({ error }) => { if (error) console.error("Page view failed:", error) }
    )
  }, [pathname])

  return null
}
