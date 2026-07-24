"use client"

import Link from "next/link"
import { locations } from "@/lib/data/locations"
import { LOCATION_TYPES } from "@/lib/utils/constants"
import { useLang } from "@/components/LanguageProvider"

function getTodayPick() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  return locations[dayOfYear % locations.length]
}

export default function DailyPick() {
  const { t } = useLang()
  const loc = getTodayPick()
  const typeInfo = LOCATION_TYPES[loc.type]

  return (
    <div className="mb-8">
      <h2 className="text-center text-sm font-black text-slate-700 mb-4 flex items-center justify-center gap-2">
        <span className="animate-bounce-gentle">🌟</span>
        {t("home_daily_pick")}
        <span className="animate-bounce-gentle" style={{ animationDelay: "0.5s" }}>🌟</span>
      </h2>
      <Link href={`/locations/${loc.id}`} className="block max-w-lg mx-auto">
        <div
          className="pixel-card bg-white p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
        >
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: typeInfo.color }}
          />
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-sm flex-shrink-0"
              style={{ backgroundColor: typeInfo.color }}
            >
              {typeInfo.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full text-white font-mono font-bold"
                  style={{ backgroundColor: typeInfo.color }}
                >
                  {typeInfo.name}
                </span>
                {loc.groupNames.slice(0, 2).map((g) => (
                  <span key={g} className="text-[10px] text-slate-400 font-mono">{g}</span>
                ))}
                {loc.groupNames.length > 2 && (
                  <span className="text-[10px] text-slate-300">+{loc.groupNames.length - 2}</span>
                )}
              </div>
              <h3 className="font-bold text-slate-700 text-base">{loc.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{loc.location.address}</p>
            </div>
            <span className="text-slate-300 text-lg">→</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
