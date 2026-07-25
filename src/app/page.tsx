"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import MapWrapper from "@/components/map/MapWrapper"
import HotPlaces from "@/components/home/HotPlaces"
import CheckInRanking from "@/components/home/CheckInRanking"
import DailyPick from "@/components/home/DailyPick"
import LatestSubmissions from "@/components/home/LatestSubmissions"
import ActivityStream from "@/components/home/ActivityStream"
import QuickStart from "@/components/home/QuickStart"
import FandomHotness from "@/components/home/FandomHotness"
import DiscoveryCard from "@/components/home/DiscoveryCard"
import { useLang } from "@/components/LanguageProvider"
import { locations } from "@/lib/data/locations"
import { groups } from "@/lib/data/groups"

const dots = [
  { color: "#3b82f6", size: 12, x: "5%", y: "15%", delay: "0s" },
  { color: "#f59e0b", size: 8, x: "92%", y: "10%", delay: "0.5s" },
  { color: "#ec4899", size: 14, x: "15%", y: "85%", delay: "1s" },
  { color: "#10b981", size: 10, x: "88%", y: "80%", delay: "0.3s" },
  { color: "#8b5cf6", size: 16, x: "3%", y: "50%", delay: "0.7s" },
  { color: "#f59e0b", size: 6, x: "95%", y: "45%", delay: "1.2s" },
  { color: "#3b82f6", size: 9, x: "80%", y: "18%", delay: "0.9s" },
  { color: "#ec4899", size: 11, x: "10%", y: "30%", delay: "0.4s" },
  { color: "#10b981", size: 7, x: "50%", y: "93%", delay: "0.6s" },
  { color: "#f59e0b", size: 13, x: "70%", y: "88%", delay: "1.1s" },
  { color: "#8b5cf6", size: 8, x: "25%", y: "8%", delay: "0.2s" },
  { color: "#3b82f6", size: 15, x: "60%", y: "12%", delay: "0.8s" },
]

const floatingEmojis = [
  { emoji: "💙", x: "8%", y: "42%", delay: "0s" },
  { emoji: "⭐", x: "90%", y: "60%", delay: "1.5s" },
  { emoji: "🎵", x: "18%", y: "72%", delay: "0.8s" },
  { emoji: "✨", x: "85%", y: "30%", delay: "2s" },
  { emoji: "💿", x: "6%", y: "68%", delay: "1.2s" },
  { emoji: "🎀", x: "93%", y: "72%", delay: "0.4s" },
]

export default function HomePage() {
  const { t, lang } = useLang()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    const locResults = locations
      .filter((l) =>
        l.name.toLowerCase().includes(q) ||
        l.nameKo.includes(q) ||
        l.groupNames.some((g) => g.toLowerCase().includes(q)) ||
        l.location.district.includes(q)
      )
      .slice(0, 5)
      .map((l) => ({ type: "location" as const, id: l.id, title: l.name, subtitle: `${l.location.district} · ${l.groupNames.slice(0, 2).join(", ")}`, lat: l.location.latitude, lng: l.location.longitude }))

    const groupResults = groups
      .filter((g) =>
        g.name.toLowerCase().includes(q) ||
        g.nameKo.includes(q) ||
        g.company.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((g) => ({ type: "group" as const, id: g.id, title: g.name, subtitle: g.company }))

    return [...locResults, ...groupResults].slice(0, 8)
  }, [searchQuery])

  const handleSelect = (r: typeof searchResults[number]) => {
    setShowDropdown(false)
    setSearchQuery("")
    if (r.type === "location" && "lat" in r) {
      setFlyToLocation({ lat: r.lat, lng: r.lng, zoom: 16 })
    } else {
      router.push(`/groups/${r.id}`)
    }
  }

  const stats = [
    { icon: "📍", label: t("home_spots"), value: String(locations.length), color: "text-blue-500" },
    { icon: "💙", label: t("home_groups"), value: String(groups.length), color: "text-blue-400" },
    { icon: "🏪", label: t("home_categories"), value: "5", color: "text-amber-500" },
    { icon: "🗺️", label: t("home_district"), value: t("home_seoul"), color: "text-emerald-500" },
  ]

  return (
    <div className="min-h-[calc(100dvh-64px)] relative overflow-hidden bg-gradient-to-b from-[#f0f4ff] via-white to-[#fffdf0]">
      {dots.map((d, i) => (
        <span
          key={`dot-${i}`}
          className="absolute rounded-full pointer-events-none animate-float opacity-70"
          style={{
            left: d.x, top: d.y, width: d.size, height: d.size,
            backgroundColor: d.color, animationDelay: d.delay,
            animationDuration: `${3 + (i % 3)}s`,
          }}
        />
      ))}

      {floatingEmojis.map((e, i) => (
        <span
          key={`emoji-${i}`}
          className="absolute text-lg pointer-events-none animate-float select-none"
          style={{
            left: e.x, top: e.y, animationDelay: e.delay,
            animationDuration: `${3.5 + (i % 3)}s`, opacity: 0.6,
          }}
        >
          {e.emoji}
        </span>
      ))}

      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 relative z-10">
        {/* Title */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-2xl animate-bounce-gentle" style={{ animationDelay: "0s" }}>🗺️</span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              <span className="text-blue-500">星旅</span>{" "}
              <span className="text-amber-500">StarTrail</span>
            </h1>
            <span className="text-2xl animate-bounce-gentle" style={{ animationDelay: "0.5s" }}>💙</span>
          </div>
          <p className="text-sm md:text-base text-gray-400 max-w-md mx-auto font-medium">
            {lang === "zh"
              ? "每一程星光，都是通向所爱的轨迹"
              : `Discover ${locations.length}+ Kpop locations across Seoul`}
          </p>
        </div>

        {/* Search bar */}
        <div ref={searchRef} className="relative max-w-md mx-auto mb-4">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm focus-within:border-blue-300 focus-within:shadow-md transition-all">
            <span className="text-slate-400 text-sm">🔍</span>
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              placeholder={t("home_search_placeholder")}
              className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-300"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setShowDropdown(false) }} className="text-slate-300 hover:text-slate-500 text-xs">✕</button>
            )}
          </div>
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50">
              {searchResults.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 transition"
                >
                  <span className="text-sm">{r.type === "location" ? "📍" : "💙"}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{r.title}</p>
                    <p className="text-[10px] text-slate-400">{r.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map with pixel frame */}
        <div className="relative mb-8">
          <div className="pixel-map-frame relative rounded-none overflow-hidden"
            style={{
              border: "4px solid #1e293b",
              boxShadow: "6px 6px 0 0 #3b82f6, 12px 12px 0 0 rgba(0,0,0,0.05), inset 0 0 0 1px rgba(30,41,59,0.1)",
            }}
          >
            <div className="absolute top-0 left-0 w-4 h-4 bg-blue-400 z-[1001] pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-amber-400 z-[1001] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-pink-400 z-[1001] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 z-[1001] pointer-events-none" />
            <div className="absolute top-[4px] left-[4px] w-2 h-2 bg-white z-[1001] pointer-events-none" />
            <div className="absolute top-[4px] right-[4px] w-2 h-2 bg-white z-[1001] pointer-events-none" />
            <div className="absolute bottom-[4px] left-[4px] w-2 h-2 bg-white z-[1001] pointer-events-none" />
            <div className="absolute bottom-[4px] right-[4px] w-2 h-2 bg-white z-[1001] pointer-events-none" />

            <div className="h-[55vh] min-h-[350px] md:h-[360px] w-full">
              <MapWrapper locations={locations} flyToLocation={flyToLocation} />
            </div>
          </div>
        </div>

        {/* Floating search button for mobile */}
        <button
          onClick={() => {
            const el = searchRef.current?.querySelector("input") as HTMLInputElement | null
            el?.scrollIntoView({ behavior: "smooth", block: "center" })
            setTimeout(() => el?.focus(), 400)
          }}
          className="md:hidden fixed bottom-24 left-3 z-30 w-11 h-11 rounded-full bg-white shadow-lg border-2 border-blue-200 flex items-center justify-center text-lg active:scale-95 transition"
        >
          🔍
        </button>

        {/* Quick Start Guide */}
        <QuickStart />

        {/* Hot Places Ranking */}
        <HotPlaces />

        {/* Fandom Hotness */}
        <FandomHotness />

        {/* Check-in Ranking */}
        <CheckInRanking />

        {/* Community Activity Stream */}
        <ActivityStream />

        {/* Daily Pick */}
        <DailyPick />

        {/* Discovery Card — fun facts, challenges, featured check-ins */}
        <DiscoveryCard />

        {/* Latest Submissions */}
        <LatestSubmissions />

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="pixel-card bg-white p-4 text-center animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-2xl">{stat.icon}</span>
              <p className={`text-xl md:text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 font-mono uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="text-center pb-4">
          <p className="text-xs text-gray-300 font-mono">{t("home_hint")}</p>
        </div>
      </div>
    </div>
  )
}
