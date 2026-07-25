"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { groups } from "@/lib/data/groups"
import { useLang } from "@/components/LanguageProvider"

interface Activity {
  id: string
  user_name: string
  group_id: string
  spot_name: string
  time_ago: string
}

function timeAgo(dateStr: string, lang: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return lang === "zh" ? "刚刚" : "just now"
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return lang === "zh" ? `${mins} 分钟前` : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return lang === "zh" ? `${hours} 小时前` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return lang === "zh" ? `${days} 天前` : `${days}d ago`
}

export default function ActivityStream() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const { lang } = useLang()

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("check_ins")
      .select("id, user_id, group_id, spot_name, created_at")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data, error }) => {
        if (!error && data) {
          const userIds = [...new Set(data.map((c: { user_id: string }) => c.user_id))]
          supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", userIds)
            .then(({ data: profiles }) => {
              const profileMap = new Map(
                (profiles || []).map((p: { id: string; display_name: string }) => [p.id, p])
              )
              setActivities(
                (data as { id: string; user_id: string; group_id: string; spot_name: string; created_at: string }[]).map(
                  (c) => {
                    const profile = profileMap.get(c.user_id)
                    return {
                      id: c.id,
                      user_name: profile?.display_name || c.user_id.slice(0, 6),
                      group_id: c.group_id,
                      spot_name: c.spot_name,
                      time_ago: timeAgo(c.created_at, lang),
                    }
                  }
                )
              )
            })
        }
        setLoading(false)
      })
  }, [lang])

  if (loading || activities.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-center text-sm font-black text-slate-700 mb-4 flex items-center justify-center gap-2">
        <span className="animate-pulse">🫧</span>
        {lang === "zh" ? "社区动态" : "Community Buzz"}
        <span className="animate-pulse" style={{ animationDelay: "0.5s" }}>🫧</span>
      </h2>

      <div className="max-w-lg mx-auto">
        <div className="bg-white/70 backdrop-blur rounded-2xl border border-blue-50 overflow-hidden">
          {activities.map((a, i) => {
            const group = groups.find((g) => g.id === a.group_id)
            return (
              <Link
                key={a.id}
                href={`/groups/${a.group_id}/house`}
                className={`flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/50 transition ${
                  i < activities.length - 1 ? "border-b border-blue-50/50" : ""
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: group?.color || "#94a3b8" }}
                >
                  {a.user_name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600 truncate">
                    <span className="font-semibold">{a.user_name}</span>
                    <span className="text-slate-400">
                      {lang === "zh" ? " 在 " : " at "}
                    </span>
                    <span className="font-medium text-slate-500">{a.spot_name}</span>
                    <span className="text-slate-400">
                      {lang === "zh" ? " 打卡了" : ""}
                    </span>
                  </p>
                </div>
                <span className="text-[10px] text-slate-300 font-mono flex-shrink-0">{a.time_ago}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
