"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { groups } from "@/lib/data/groups"
import { useLang } from "@/components/LanguageProvider"

interface FandomRank {
  group_id: string
  count: number
}

export default function FandomHotness() {
  const [fandoms, setFandoms] = useState<FandomRank[]>([])
  const [loading, setLoading] = useState(true)
  const { lang } = useLang()

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("check_ins")
      .select("group_id")
      .then(({ data, error }) => {
        if (!error && data) {
          const fandomCount: Record<string, number> = {}
          for (const row of data as { group_id: string }[]) {
            fandomCount[row.group_id] = (fandomCount[row.group_id] || 0) + 1
          }
          const ranked = Object.entries(fandomCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([group_id, count]) => ({ group_id, count }))
          setFandoms(ranked)
        }
        setLoading(false)
      })
  }, [])

  if (loading || fandoms.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-center text-sm font-black text-slate-700 mb-4 flex items-center justify-center gap-2">
        <span className="animate-sparkle">🔥</span>
        {lang === "zh" ? "粉丝团热度榜" : "Hot Fandoms"}
        <span className="animate-sparkle" style={{ animationDelay: "1s" }}>🔥</span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {fandoms.map((f, i) => {
          const group = groups.find((g) => g.id === f.group_id)
          if (!group) return null
          const medals = ["🥇", "🥈", "🥉", "🏅"]
          return (
            <Link
              key={f.group_id}
              href={`/groups/${f.group_id}/house`}
              className="group pixel-card bg-white p-4 text-center hover:-translate-y-1 transition-all duration-200"
            >
              <span className="text-lg">{medals[i]}</span>
              <div
                className="w-10 h-10 mx-auto my-2 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: group.color }}
              >
                {group.name[0]}
              </div>
              <p className="font-bold text-sm text-slate-700 group-hover:text-blue-500 transition">
                {group.name}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">{group.fandomName}</p>
              <p className="text-xs text-amber-500 font-bold mt-1">
                {f.count} {lang === "zh" ? "打卡" : "posts"}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
