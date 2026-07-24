"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { groups } from "@/lib/data/groups"
import { useLang } from "@/components/LanguageProvider"

interface UserRank {
  user_id: string
  display_name: string
  fan_group_id: string
  count: number
}

interface FandomRank {
  group_id: string
  count: number
}

export default function CheckInRanking() {
  const [users, setUsers] = useState<UserRank[]>([])
  const [fandoms, setFandoms] = useState<FandomRank[]>([])
  const [tab, setTab] = useState<"users" | "fandoms">("users")
  const [loading, setLoading] = useState(true)
  const { t } = useLang()

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("check_ins")
      .select("user_id, group_id")
      .then(({ data, error }) => {
        if (!error && data) {
          // Aggregate users
          const userCount: Record<string, { user_id: string; group_id: string; count: number }> = {}
          // Aggregate fandoms
          const fandomCount: Record<string, number> = {}

          for (const row of data as { user_id: string; group_id: string }[]) {
            if (userCount[row.user_id]) {
              userCount[row.user_id].count++
            } else {
              userCount[row.user_id] = { user_id: row.user_id, group_id: row.group_id, count: 1 }
            }
            fandomCount[row.group_id] = (fandomCount[row.group_id] || 0) + 1
          }

          // Get profiles for users
          supabase
            .from("profiles")
            .select("id, display_name, fan_group_id")
            .in("id", Object.keys(userCount))
            .then(({ data: profiles }) => {
              const profileMap = new Map(
                (profiles || []).map((p: { id: string; display_name: string; fan_group_id: string }) => [p.id, p])
              )
              const ranked: UserRank[] = Object.values(userCount)
                .map((u) => {
                  const p = profileMap.get(u.user_id)
                  return {
                    user_id: u.user_id,
                    display_name: p?.display_name || u.user_id.slice(0, 8),
                    fan_group_id: p?.fan_group_id || u.group_id,
                    count: u.count,
                  }
                })
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
              setUsers(ranked)
            })

          const rankedFandoms: FandomRank[] = Object.entries(fandomCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([group_id, count]) => ({ group_id, count }))
          setFandoms(rankedFandoms)
        }
        setLoading(false)
      })
  }, [])

  if (loading) return null
  if (users.length === 0 && fandoms.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-center text-sm font-black pixel-font text-slate-700 mb-4 flex items-center justify-center gap-2">
        <span className="animate-sparkle">🏆</span>
        Check-in Ranking
        <span className="animate-sparkle" style={{ animationDelay: "1s" }}>🏆</span>
      </h2>

      <div className="pixel-card bg-white max-w-lg mx-auto overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b-2 border-slate-100">
          <button
            onClick={() => setTab("users")}
            className={`flex-1 py-2.5 text-xs font-bold font-mono transition ${
              tab === "users"
                ? "text-blue-500 border-b-2 border-blue-500 bg-blue-50/50"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Top Contributors
          </button>
          <button
            onClick={() => setTab("fandoms")}
            className={`flex-1 py-2.5 text-xs font-bold font-mono transition ${
              tab === "fandoms"
                ? "text-blue-500 border-b-2 border-blue-500 bg-blue-50/50"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Active Fandoms
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {tab === "users" ? (
            <div className="space-y-1">
              {users.map((u, i) => {
                const group = groups.find((g) => g.id === u.fan_group_id)
                return (
                  <div key={u.user_id} className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition group rounded-lg">
                    <span className={`text-sm font-black font-mono w-6 text-center ${
                      i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-600" : "text-slate-300"
                    }`}>
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}`}
                    </span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: group?.color || "#94a3b8" }}
                    >
                      {u.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-700 truncate font-mono">
                      {u.display_name}
                    </span>
                    {group && (
                      <span className="text-[10px] text-slate-300 font-mono truncate max-w-[80px]">
                        {group.name}
                      </span>
                    )}
                    <span className="text-xs text-amber-500 font-bold font-mono">{u.count} 🔥</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {fandoms.map((f, i) => {
                const group = groups.find((g) => g.id === f.group_id)
                if (!group) return null
                return (
                  <Link
                    key={f.group_id}
                    href={`/groups/${f.group_id}/house`}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition group rounded-lg"
                  >
                    <span className={`text-sm font-black font-mono w-6 text-center ${
                      i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-600" : "text-slate-300"
                    }`}>
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}`}
                    </span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: group.color }}
                    >
                      {group.name[0]}
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-700 truncate font-mono group-hover:text-blue-500 transition">
                      {group.name}
                    </span>
                    <span className="text-xs text-slate-300 font-mono">{group.fandomName}</span>
                    <span className="text-xs text-amber-500 font-bold font-mono ml-2">{f.count} 🔥</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
