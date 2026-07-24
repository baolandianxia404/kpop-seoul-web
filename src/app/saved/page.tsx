"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLang } from "@/components/LanguageProvider"
import { LOCATION_TYPES } from "@/lib/utils/constants"
import { groups } from "@/lib/data/groups"
import type { Itinerary } from "@/types"
import { locations } from "@/lib/data/locations"
import PageGuide from "@/components/ui/PageGuide"

function removeFavorite(id: string) {
  try {
    const arr = JSON.parse(localStorage.getItem("kpop_favorites") || "[]")
    localStorage.setItem("kpop_favorites", JSON.stringify(arr.filter((x: string) => x !== id)))
  } catch {}
}

export default function SavedPage() {
  const { t } = useLang()
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>([])
  const [pendingSpots, setPendingSpots] = useState<
    { locationId: string; locationName: string; locationType: string }[]
  >([])
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [tab, setTab] = useState<"favorites" | "spots" | "itineraries">("favorites")
  const [mounted, setMounted] = useState(false)

  const load = () => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("kpop_favorites") || "[]"))
      setPendingSpots(JSON.parse(localStorage.getItem("kpop_pending_spots") || "[]"))
      setItineraries(JSON.parse(localStorage.getItem("kpop_itineraries") || "[]"))
    } catch {}
  }

  useEffect(() => {
    load()
    setMounted(true)
  }, [])

  const favoriteLocs = locations.filter((l) => favorites.includes(l.id))

  const removeItinerary = (title: string) => {
    const updated = itineraries.filter((i) => i.title !== title)
    setItineraries(updated)
    localStorage.setItem("kpop_itineraries", JSON.stringify(updated))
  }

  const removePending = (id: string) => {
    const updated = pendingSpots.filter((s) => s.locationId !== id)
    setPendingSpots(updated)
    localStorage.setItem("kpop_pending_spots", JSON.stringify(updated))
  }

  const removeFav = (id: string) => {
    removeFavorite(id)
    setFavorites((prev) => prev.filter((x) => x !== id))
  }

  const viewItinerary = (itin: Itinerary) => {
    sessionStorage.setItem("current_itinerary", JSON.stringify(itin))
    router.push("/itinerary")
  }

  const tabs = [
    { key: "favorites" as const, label: "Favorites", icon: "❤️", count: favoriteLocs.length },
    { key: "spots" as const, label: "Saved Spots", icon: "📍", count: pendingSpots.length },
    { key: "itineraries" as const, label: "Itineraries", icon: "🗺️", count: itineraries.length },
  ]

  const activeTab = tabs.find((t) => t.key === tab)!

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-[#f0f4ff] via-white to-[#fffdf0]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl animate-bounce-gentle">💾</span>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-blue-500">My</span>{" "}
              <span className="text-amber-500">Collection</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">Favorites · Saved spots · Itineraries</p>
        </div>

        <PageGuide pageKey="saved" emoji="💾" title="收藏夹怎么用？">
          收藏分三类：<strong>Favorites</strong>（心仪的地点）、<strong>Saved Spots</strong>（准备加入行程的地点）、<strong>Itineraries</strong>（生成好的路线）。点路线卡片可以直接查看完整行程～
        </PageGuide>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-100 rounded-xl p-1.5 mb-6">
          {tabs.map(({ key, label, icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold font-mono transition-all duration-200 ${
                tab === key
                  ? "bg-white text-slate-800 shadow-sm scale-[1.02]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="mr-1">{icon}</span>
              {label}
              {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  tab === key ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-400"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {!mounted ? null : tab === "favorites" ? (
          favoriteLocs.length === 0 ? (
            <EmptyState emoji="❤️" title="No favorites yet" hint="Click the heart on any location to save it here" link="/locations" linkText="Browse locations →" />
          ) : (
            <div className="space-y-3">
              {favoriteLocs.map((loc) => {
                const typeInfo = LOCATION_TYPES[loc.type]
                return (
                  <div key={loc.id} className="pixel-card bg-white p-4 group flex items-center gap-4">
                    <div
                      className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-lg text-white font-bold"
                      style={{
                        backgroundColor: typeInfo?.color || "#3b82f6",
                        border: "2px solid #1e293b",
                      }}
                    >
                      {typeInfo?.icon || "📍"}
                    </div>
                    <Link href={`/locations/${loc.id}`} className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-500 transition truncate">
                        {loc.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono truncate">
                        {loc.location.district} · {typeInfo?.name || loc.type}
                      </p>
                    </Link>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {loc.rating > 0 && (
                        <span className="text-amber-400 text-xs font-bold font-mono">★ {loc.rating}</span>
                      )}
                      <button
                        onClick={() => removeFav(loc.id)}
                        className="text-xs text-slate-300 hover:text-red-400 transition font-mono"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : tab === "spots" ? (
          pendingSpots.length === 0 ? (
            <EmptyState emoji="📍" title="No saved spots" hint="Add spots from routes or the map to plan your trip" link="/routes" linkText="Explore routes →" />
          ) : (
            <div className="space-y-3">
              {pendingSpots.map((spot) => {
                const loc = locations.find((l) => l.id === spot.locationId)
                const typeInfo = LOCATION_TYPES[spot.locationType] || LOCATION_TYPES.restaurant
                return (
                  <div key={spot.locationId} className="pixel-card bg-white p-4 group flex items-center gap-4">
                    <div
                      className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-lg text-white font-bold"
                      style={{
                        backgroundColor: typeInfo?.color || "#3b82f6",
                        border: "2px solid #1e293b",
                      }}
                    >
                      {typeInfo?.icon || "📍"}
                    </div>
                    <div className="flex-1 min-w-0">
                      {loc ? (
                        <Link href={`/locations/${loc.id}`}>
                          <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-500 transition truncate">
                            {spot.locationName}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="font-bold text-sm text-slate-800 truncate">{spot.locationName}</h3>
                      )}
                      <p className="text-xs text-slate-400 font-mono">
                        {loc ? `${loc.location.district} · ` : ""}{typeInfo?.name || spot.locationType}
                      </p>
                    </div>
                    <button
                      onClick={() => removePending(spot.locationId)}
                      className="text-xs text-slate-300 hover:text-red-400 transition font-mono flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}

              {pendingSpots.length > 0 && (
                <Link
                  href="/plan"
                  className="block text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-amber-500 text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform"
                >
                  ✨ Generate a route with these spots →
                </Link>
              )}
            </div>
          )
        ) : itineraries.length === 0 ? (
          <EmptyState emoji="🗺️" title="No itineraries yet" hint="Generate your first route and it will be saved here" link="/plan" linkText="Plan a route →" />
        ) : (
          <div className="space-y-4">
            {itineraries.map((itin) => {
              const totalSpots = itin.totalSpots || itin.days.reduce((s, d) => s + d.spots.length, 0)
              const firstGroupId = itin.params?.groupIds?.[0]
              const group = firstGroupId ? groups.find((g) => g.id === firstGroupId) : null
              return (
                <div
                  key={itin.title}
                  className="pixel-card bg-white overflow-hidden cursor-pointer group"
                  onClick={() => viewItinerary(itin)}
                >
                  {/* Card top bar */}
                  <div className="h-1.5 bg-gradient-to-r from-blue-400 via-amber-400 to-pink-400" />

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-500 transition truncate">
                          {itin.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                          <span>📅 {itin.days.length} {itin.days.length === 1 ? "day" : "days"}</span>
                          <span>📍 {totalSpots} spots</span>
                          {group && (
                            <span
                              className="px-1.5 py-0.5 rounded-full text-white text-[10px]"
                              style={{ backgroundColor: group.color }}
                            >
                              {group.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeItinerary(itin.title) }}
                        className="text-xs text-slate-300 hover:text-red-400 transition font-mono ml-2 flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Day preview chips */}
                    <div className="flex gap-1.5 flex-wrap">
                      {itin.days.map((day, i) => (
                        <span
                          key={day.day}
                          className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors"
                          style={{
                            backgroundColor: i === 0 ? "#eff6ff" : i === 1 ? "#fff7ed" : "#f0fdf4",
                            color: i === 0 ? "#3b82f6" : i === 1 ? "#f59e0b" : "#10b981",
                          }}
                        >
                          D{day.day}: {day.title}
                        </span>
                      ))}
                    </div>

                    {/* Spot count per day */}
                    <div className="flex gap-3 mt-3 pt-3 border-t border-dashed border-slate-100">
                      {itin.days.map((day) => (
                        <div key={day.day} className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          Day {day.day}: {day.spots.length} spots
                        </div>
                      ))}
                    </div>

                    {itin.createdAt && (
                      <p className="text-[10px] text-slate-300 font-mono mt-2">
                        {new Date(itin.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ emoji, title, hint, link, linkText }: {
  emoji: string; title: string; hint: string; link: string; linkText: string
}) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl animate-bounce-gentle"
        style={{ border: "3px dashed #cbd5e1", backgroundColor: "#f8fafc" }}
      >
        {emoji}
      </div>
      <p className="font-bold text-slate-700 mb-2 pixel-font">{title}</p>
      <p className="text-xs text-slate-400 font-mono mb-5 max-w-xs mx-auto">{hint}</p>
      <Link
        href={link}
        className="inline-block px-5 py-2.5 rounded-xl font-bold text-sm text-white transition hover:scale-105"
        style={{ background: "linear-gradient(135deg, #3b82f6, #f59e0b)" }}
      >
        {linkText}
      </Link>
    </div>
  )
}
