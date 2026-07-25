"use client"

import { useState } from "react"
import Link from "next/link"
import type { Location } from "@/types"
import { LOCATION_TYPES } from "@/lib/utils/constants"

export default function RouteTimeline({ spots }: { spots: Location[] }) {
  const [added, setAdded] = useState<Set<string>>(new Set())

  const addToPlan = (loc: Location) => {
    try {
      const stored = JSON.parse(localStorage.getItem("kpop_pending_spots") || "[]")
      if (!stored.some((s: { locationId: string }) => s.locationId === loc.id)) {
        stored.push({ locationId: loc.id, locationName: loc.name, locationType: loc.type })
        localStorage.setItem("kpop_pending_spots", JSON.stringify(stored))
      }
    } catch {}
    setAdded((prev) => new Set(prev).add(loc.id))
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 rounded-full" />

      <div className="space-y-3">
        {spots.map((loc, i) => {
          const typeInfo = LOCATION_TYPES[loc.type]
          return (
            <div key={loc.id} className="flex gap-4 relative">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0 pt-1">
                <div
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md border-2 border-white"
                  style={{ backgroundColor: typeInfo?.color || "#94a3b8" }}
                >
                  {i + 1}
                </div>
              </div>

              {/* Card */}
              <Link
                href={`/locations/${loc.id}`}
                className="flex-1 bg-white rounded-xl border-2 border-slate-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{typeInfo?.icon || "📍"}</span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full text-white font-mono font-bold"
                        style={{ backgroundColor: typeInfo?.color || "#94a3b8" }}
                      >
                        {typeInfo?.name || loc.type}
                      </span>
                      {loc.rating && (
                        <span className="text-[10px] text-amber-400 font-mono">★ {loc.rating}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-700 group-hover:text-blue-500 transition mb-1">
                      {loc.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">{loc.location.address}</p>
                    {loc.transport?.subway?.station && (
                      <p className="text-[10px] text-slate-300 font-mono mt-1">
                        🚇 {loc.transport.subway.station}
                        {loc.transport.subway.walkingMinutes && ` ${loc.transport.subway.walkingMinutes}min walk`}
                      </p>
                    )}
                  </div>
                </div>
              </Link>

              {/* Quick add button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  addToPlan(loc)
                }}
                className={`flex-shrink-0 self-center px-3 py-1.5 text-[10px] font-bold font-mono rounded-lg transition ${
                  added.has(loc.id)
                    ? "bg-amber-100 text-amber-600"
                    : "text-slate-300 hover:text-amber-500 hover:bg-amber-50 border border-slate-100"
                }`}
              >
                {added.has(loc.id) ? "✓" : "+"}
              </button>
            </div>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105 hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #3b82f6, #f59e0b)" }}
        >
          ✨ Generate AI Itinerary from this route
        </Link>
      </div>
    </div>
  )
}
