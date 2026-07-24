"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { groups } from "@/lib/data/groups"
import { useLang } from "@/components/LanguageProvider"

interface Submission {
  id: string
  location_name: string
  group_ids: string[]
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export default function LatestSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLang()

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("community_spots")
      .select("id, location_name, group_ids, created_at")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data, error }) => {
        if (!error && data) {
          setSubmissions(data as Submission[])
        }
        setLoading(false)
      })
  }, [])

  if (loading || submissions.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-center text-sm font-black text-slate-700 mb-4 flex items-center justify-center gap-2">
        <span className="animate-sparkle">📮</span>
        {t("home_latest_submissions")}
        <span className="animate-sparkle" style={{ animationDelay: "1s" }}>📮</span>
      </h2>
      <div className="pixel-card bg-white p-4 max-w-lg mx-auto">
        <div className="space-y-1">
          {submissions.map((sub) => {
            const group = groups.find((g) => sub.group_ids?.includes(g.id))
            return (
              <Link
                key={sub.id}
                href={group ? `/groups/${group.id}` : "/groups"}
                className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition group rounded-lg"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  style={{ backgroundColor: group?.color || "#94a3b8" }}
                >
                  {group?.name?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-500 transition">
                    {sub.location_name || t("home_untitled_spot")}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {group?.name || "?"} · {timeAgo(sub.created_at)}
                  </p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  sub.location_name
                    ? "bg-green-50 text-green-500"
                    : "bg-amber-50 text-amber-500"
                }`}>
                  {sub.location_name ? "✓" : "draft"}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
