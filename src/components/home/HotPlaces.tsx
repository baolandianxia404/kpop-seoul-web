"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useLang } from "@/components/LanguageProvider"

interface HotSpot {
  spot_name: string
  group_id: string
  count: number
}

export default function HotPlaces() {
  const [spots, setSpots] = useState<HotSpot[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLang()

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("check_ins")
      .select("spot_name, group_id")
      .then(({ data, error }) => {
        if (!error && data) {
          const counter: Record<string, HotSpot> = {}
          for (const row of data as { spot_name: string; group_id: string }[]) {
            const key = row.spot_name
            if (counter[key]) counter[key].count++
            else counter[key] = { spot_name: row.spot_name, group_id: row.group_id, count: 1 }
          }
          const sorted = Object.values(counter)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
          setSpots(sorted)
        }
        setLoading(false)
      })
  }, [])

  if (loading) return null
  if (spots.length === 0) return null

  const medalColors = ["text-amber-400", "text-slate-400", "text-amber-600"]

  return (
    <div className="mb-8">
      <h2 className="text-center text-sm font-black pixel-font text-slate-700 mb-4 flex items-center justify-center gap-2">
        <span className="animate-sparkle">🔥</span>
        {t("home_hot_places")}
        <span className="animate-sparkle" style={{ animationDelay: "1s" }}>🔥</span>
      </h2>
      <div className="pixel-card bg-white p-4 max-w-lg mx-auto">
        <div className="space-y-1">
          {spots.map((spot, i) => (
            <Link
              key={spot.spot_name}
              href={`/groups/${spot.group_id}/house`}
              className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition group"
            >
              <span className={`text-sm font-black font-mono w-6 text-center ${
                i < 3 ? medalColors[i] : "text-slate-300"
              }`}>
                {i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}`}
              </span>
              <span className="flex-1 text-sm font-medium text-slate-700 font-mono truncate group-hover:text-blue-500 transition">
                {spot.spot_name}
              </span>
              <span className="text-xs text-slate-300 font-mono">{spot.count} 🔥</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
