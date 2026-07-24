"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import type { Itinerary } from "@/types"
import { LOCATION_TYPES } from "@/lib/utils/constants"
import { groups } from "@/lib/data/groups"

const DayRouteMap = dynamic(() => import("@/components/itinerary/DayRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 rounded-xl bg-slate-100 animate-pulse flex items-center justify-center border-2 border-dashed border-slate-200">
      <p className="text-xs text-slate-400 font-mono">Loading map...</p>
    </div>
  ),
})

const transportIcons: Record<string, string> = { walk: "🚶", subway: "🚇", bus: "🚌" }

function ItineraryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [activeDay, setActiveDay] = useState(0)
  const [error, setError] = useState("")

  useEffect(() => {
    // Try URL data param first
    const dataParam = searchParams.get("data")
    if (dataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(dataParam))
        setItinerary(parsed)
        saveToLocal(parsed)
        return
      } catch {
        setError("Failed to load itinerary data")
        return
      }
    }

    // Try sessionStorage (from saved page)
    try {
      const stored = sessionStorage.getItem("current_itinerary")
      if (stored) {
        const parsed = JSON.parse(stored)
        setItinerary(parsed)
        sessionStorage.removeItem("current_itinerary")
        return
      }
    } catch {}

    // Try localStorage as last resort
    try {
      const list = JSON.parse(localStorage.getItem("kpop_itineraries") || "[]")
      if (list.length > 0) {
        setItinerary(list[0])
        return
      }
    } catch {}

    if (!dataParam) {
      setError("No itinerary data found.")
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveToLocal = (itin: Itinerary) => {
    try {
      const stored = JSON.parse(localStorage.getItem("kpop_itineraries") || "[]")
      if (!stored.some((s: Itinerary) => s.title === itin.title)) {
        stored.unshift({ ...itin, createdAt: new Date().toISOString() })
        localStorage.setItem("kpop_itineraries", JSON.stringify(stored.slice(0, 10)))
      }
    } catch {}
  }

  if (error) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center bg-gradient-to-b from-[#f0f4ff] via-white to-[#fffdf0]">
        <div className="text-center px-4">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl"
            style={{ border: "3px dashed #cbd5e1", backgroundColor: "#f8fafc" }}
          >
            🗺️
          </div>
          <p className="font-bold text-slate-700 mb-1">{error}</p>
          <p className="text-xs text-slate-400 font-mono mb-5">Generate a route from Plan or Saved page</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/plan"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition hover:scale-105"
              style={{ background: "linear-gradient(135deg, #3b82f6, #f59e0b)" }}
            >
              ✨ Plan a Route
            </Link>
            <Link
              href="/saved"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-white border-2 border-slate-200 hover:border-slate-300 transition"
            >
              💾 My Collection
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center bg-gradient-to-b from-[#f0f4ff] via-white to-[#fffdf0]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400 font-mono">Loading itinerary...</p>
        </div>
      </div>
    )
  }

  const currentDay = itinerary.days[activeDay]
  const totalSpots = itinerary.totalSpots || itinerary.days.reduce((s, d) => s + d.spots.length, 0)
  const firstGroupId = itinerary.params?.groupIds?.[0]
  const tripGroup = firstGroupId ? groups.find((g) => g.id === firstGroupId) : null

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-[#f0f4ff] via-white to-[#fffdf0]">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header card */}
        <div className="relative overflow-hidden text-white" style={{
          background: tripGroup
            ? `linear-gradient(135deg, ${tripGroup.color}, ${tripGroup.color}cc)`
            : "linear-gradient(135deg, #3b82f6, #f59e0b)",
          border: "3px solid #1e293b",
          boxShadow: "4px 4px 0 0 rgba(0,0,0,0.15)",
        }}>
          {/* Decorative pixels */}
          <div className="absolute top-2 right-3 flex gap-1">
            <div className="w-1.5 h-1.5 bg-white/40" />
            <div className="w-1.5 h-1.5 bg-white/60" />
            <div className="w-1.5 h-1.5 bg-white/40" />
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold pixel-font leading-tight">{itinerary.title}</h1>
              <Link
                href="/plan"
                className="pixel-btn px-3 py-1.5 text-xs bg-white/20 text-white border-white/30 hover:bg-white/30 transition"
              >
                New
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-3 text-white/80 text-xs font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-300" />
                {itinerary.days.length} {itinerary.days.length === 1 ? "Day" : "Days"}
              </span>
              <span className="text-white/30">·</span>
              <span>{totalSpots} spots</span>
              {tripGroup && (
                <>
                  <span className="text-white/30">·</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white/90">
                    {tripGroup.name}
                  </span>
                </>
              )}
              {itinerary.params?.budget && (
                <>
                  <span className="text-white/30">·</span>
                  <span className="uppercase">{itinerary.params.budget}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {itinerary.days.map((day, i) => (
            <button
              key={day.day}
              onClick={() => setActiveDay(i)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all duration-200 border-2 ${
                activeDay === i
                  ? "bg-white text-slate-800 border-slate-800 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] scale-[1.02]"
                  : "bg-white/60 text-slate-400 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="block text-[10px] opacity-60">Day {day.day}</span>
              <span className="block text-xs mt-0.5">{day.title}</span>
              <span className="block text-[10px] opacity-50 mt-0.5">{day.spots.length} spots</span>
            </button>
          ))}
        </div>

        {currentDay && (
          <>
            {/* Day description */}
            <div
              className="p-4 border-2 bg-white border-dashed"
              style={{
                borderColor: activeDay === 0 ? "#bfdbfe" : activeDay === 1 ? "#fde68a" : "#bbf7d0",
                backgroundColor: activeDay === 0 ? "#eff6ff" : activeDay === 1 ? "#fffbeb" : "#f0fdf4",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {activeDay === 0 ? "🌅" : activeDay === 1 ? "☀️" : "🌙"}
                </span>
                <h2 className="font-bold text-sm text-slate-800">
                  Day {currentDay.day}: {currentDay.title}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-mono leading-relaxed">
                {currentDay.description}
              </p>
            </div>

            {/* Route map */}
            <div className="overflow-hidden border-2 border-slate-800" style={{
              boxShadow: "4px 4px 0 0 rgba(0,0,0,0.08)",
            }}>
              <DayRouteMap spots={currentDay.spots} />
            </div>

            {/* Timeline */}
            <div className="relative pl-8">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5"
                style={{
                  background: `repeating-linear-gradient(to bottom, #cbd5e1 0px, #cbd5e1 4px, transparent 4px, transparent 8px)`,
                }}
              />

              <div className="space-y-3">
                {currentDay.spots.map((spot, i) => {
                  const typeInfo = LOCATION_TYPES[spot.locationType]
                  return (
                    <div key={`${spot.locationId}-${i}`} className="relative group">
                      {/* Timeline dot */}
                      <div
                        className="absolute -left-[23px] top-3 w-4 h-4 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                        style={{
                          backgroundColor: typeInfo?.color || "#3b82f6",
                          border: "2px solid white",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      >
                        {i + 1}
                      </div>

                      <Link
                        href={`/locations/${spot.locationId}`}
                        className="block bg-white p-3.5 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                        style={{
                          border: "2px solid #e2e8f0",
                          boxShadow: "2px 2px 0 0 rgba(0,0,0,0.03)",
                        }}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{typeInfo?.icon || "📍"}</span>
                              <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-500 transition truncate">
                                {spot.locationName}
                              </h4>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 ml-6">
                              {typeInfo?.name || spot.locationType}
                              {spot.note && ` · ${spot.note}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: (typeInfo?.color || "#3b82f6") + "18",
                                color: typeInfo?.color || "#3b82f6",
                              }}
                            >
                              {spot.estimatedArrival}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono ml-6">
                          <span>⏱ {spot.estimatedDuration}min</span>
                        </div>

                        {spot.nextTransport && (
                          <div className="mt-2.5 pt-2.5 border-t border-dashed border-slate-100 ml-6">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                              spot.nextTransport.type === "walk"
                                ? "bg-green-50 text-green-600"
                                : spot.nextTransport.type === "subway"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-orange-50 text-orange-600"
                            }`}>
                              <span>{transportIcons[spot.nextTransport.type]}</span>
                              <span>{spot.nextTransport.duration}min</span>
                              {spot.nextTransport.note && <span>· {spot.nextTransport.note}</span>}
                            </span>
                          </div>
                        )}
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Bottom actions */}
        <div className="flex gap-3 pt-2 pb-4">
          <Link
            href="/saved"
            className="flex-1 text-center py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-white border-2 border-slate-200 hover:border-slate-300 transition"
          >
            💾 My Collection
          </Link>
          <Link
            href="/plan"
            className="flex-1 text-center py-2.5 rounded-xl font-bold text-xs text-white transition hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #3b82f6, #f59e0b)" }}
          >
            ✨ Plan Another
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ItineraryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center bg-gradient-to-b from-[#f0f4ff] via-white to-[#fffdf0]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400 font-mono">Loading...</p>
          </div>
        </div>
      }
    >
      <ItineraryContent />
    </Suspense>
  )
}
