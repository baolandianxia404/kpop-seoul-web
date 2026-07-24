"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { locations } from "@/lib/data/locations"
import { LOCATION_TYPES, TYPE_NAME_CN, DISTRICTS } from "@/lib/utils/constants"
import LocationCard from "@/components/location/LocationCard"
import type { LocationType } from "@/types"
import { useLang } from "@/components/LanguageProvider"

function getSubwayLines(loc: (typeof locations)[number]): string[] {
  const raw = loc.transport?.subway?.line
  if (!raw) return []
  return raw.split("/").map((s) => s.trim()).filter(Boolean)
}

function matchesSubwayLine(loc: (typeof locations)[number], line: string): boolean {
  return getSubwayLines(loc).includes(line)
}

// Extract unique subway lines from data
const ALL_SUBWAY_LINES = [...new Set(
  locations.flatMap((l) => getSubwayLines(l))
)].sort((a, b) => {
  const na = parseInt(a.replace(/[^0-9]/g, "")) || 99
  const nb = parseInt(b.replace(/[^0-9]/g, "")) || 99
  return na - nb || a.localeCompare(b)
})

const CATEGORIES: { key: LocationType | ""; label: string; icon: string }[] = [
  { key: "", label: "ALL", icon: "🌟" },
  { key: "company", label: "公司", icon: "🏢" },
  { key: "restaurant", label: "美食", icon: "🍽️" },
  { key: "mv_spot", label: "MV", icon: "🎬" },
  { key: "store", label: "周边", icon: "🛍️" },
  { key: "entertainment", label: "娱乐", icon: "🎡" },
]

export default function LocationsPage() {
  const { t } = useLang()
  const [activeType, setActiveType] = useState<LocationType | "">("")
  const [activeDistrict, setActiveDistrict] = useState("")
  const [activeSubwayLine, setActiveSubwayLine] = useState("")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating")
  const [clickCount, setClickCount] = useState(0)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Scroll to results when filters change
  useEffect(() => {
    if (activeType || activeDistrict || activeSubwayLine || search) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [activeType, activeDistrict, activeSubwayLine, search])

  // Pre-compute counts per filter
  const counts = useMemo(() => {
    const byType: Record<string, number> = {}
    const byDistrict: Record<string, number> = {}
    const bySubway: Record<string, number> = {}
    for (const l of locations) {
      byType[l.type] = (byType[l.type] || 0) + 1
      byDistrict[l.location.district] = (byDistrict[l.location.district] || 0) + 1
      for (const line of getSubwayLines(l)) {
        bySubway[line] = (bySubway[line] || 0) + 1
      }
    }
    return { byType, byDistrict, bySubway }
  }, [])

  // Compute filtered list inline during render — no hooks, no stale values
  let result = [...locations]
  if (activeType) result = result.filter((l) => l.type === activeType)
  if (activeDistrict) result = result.filter((l) => l.location.district === activeDistrict)
  if (activeSubwayLine) result = result.filter((l) => matchesSubwayLine(l, activeSubwayLine))
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nameKo.includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.groupNames.some((g) => g.toLowerCase().includes(q)) ||
        l.transport?.subway?.station?.toLowerCase().includes(q) ||
        getSubwayLines(l).some((line) => line.toLowerCase().includes(q))
    )
  }
  if (sortBy === "rating") result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  else result.sort((a, b) => a.name.localeCompare(b.name))
  const filtered = result

  const hasActiveFilters = !!(activeType || activeDistrict || activeSubwayLine || search)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-4xl mb-2">🗺️📍</p>
        <h1 className="text-2xl font-bold pixel-font text-slate-800">
          {t("locations_title")}
        </h1>
        <p className="text-sm text-slate-400 mt-1 pixel-font">
          {locations.length} locations across {DISTRICTS.length} districts
        </p>
        {/* Debug panel */}
        <div className="mt-3 p-2 bg-yellow-100 rounded text-[10px] font-mono text-left inline-block">
          <div>clickCount: {clickCount}</div>
          <div>activeType: "{activeType}"</div>
          <div>activeDistrict: "{activeDistrict}"</div>
          <div>activeSubwayLine: "{activeSubwayLine}"</div>
          <div>search: "{search}"</div>
          <div>filtered: {filtered.length}</div>
          <button onClick={() => setClickCount((c) => c + 1)} className="mt-1 px-2 py-0.5 bg-yellow-400 rounded text-[10px]">
            Test React
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative pixel-border-dashed bg-white">
          <input
            type="text"
            placeholder={`> ${t("locations_search")}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 text-sm font-mono bg-transparent outline-none text-slate-700 placeholder:text-slate-300"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 font-mono text-xs"
            >
              [X]
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-300 font-mono mt-1">
          Search by name, group, subway station or line
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        {CATEGORIES.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveType(key)}
            className={`pixel-btn px-3 py-2.5 md:py-2 text-xs flex items-center gap-1 min-h-[44px] md:min-h-0 ${
              activeType === key
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 hover:bg-amber-50"
            }`}
          >
            <span className="text-sm">{icon}</span>
            <span>{key === "" ? t("locations_filter_all") : label}</span>
            {key === "" ? (
              <span className="text-[10px] opacity-60">({locations.length})</span>
            ) : (
              <span className="text-[10px] opacity-60">({counts.byType[key] || 0})</span>
            )}
          </button>
        ))}
      </div>

      {/* Subway Line Filter */}
      <div className="mb-3">
        <p className="text-[10px] font-mono text-slate-400 mb-1.5">🚇 Filter by subway line</p>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 flex-wrap">
          <button
            onClick={() => setActiveSubwayLine("")}
            className={`flex-shrink-0 px-2 py-1 text-[10px] font-mono transition ${
              activeSubwayLine === ""
                ? "bg-green-500 text-white rounded-full"
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-full"
            }`}
          >
            ALL
          </button>
          {ALL_SUBWAY_LINES.map((line) => (
            <button
              key={line}
              onClick={() => setActiveSubwayLine(line)}
              className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-mono rounded-full transition ${
                activeSubwayLine === line
                  ? "bg-green-500 text-white"
                  : "bg-white text-slate-500 hover:bg-green-50 border border-slate-200"
              }`}
            >
              {line} <span className="opacity-60">({counts.bySubway[line] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* District Filter */}
      <div className="mb-4">
        <p className="text-[10px] font-mono text-slate-400 mb-1.5">📍 Filter by district</p>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 flex-wrap">
          <button
            onClick={() => setActiveDistrict("")}
            className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-mono rounded-full transition ${
              activeDistrict === ""
                ? "bg-blue-500 text-white"
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {t("locations_filter_all")} ({locations.length})
          </button>
          {DISTRICTS.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDistrict(d)}
              className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-mono rounded-full transition ${
                activeDistrict === d
                  ? "bg-amber-400 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {d} ({counts.byDistrict[d] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Sort + Results count */}
      <div className="flex items-center justify-between mb-4 text-xs font-mono text-slate-400">
        <span>
          <span className="font-bold text-slate-600">{filtered.length}</span> / {locations.length} SPOTS
          {hasActiveFilters && " (filtered)"}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("rating")}
            className={`px-2 py-0.5 ${sortBy === "rating" ? "text-amber-500 font-bold" : ""}`}
          >
            ★ RATING
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-2 py-0.5 ${sortBy === "name" ? "text-blue-500 font-bold" : ""}`}
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] text-slate-400 font-mono">Active:</span>
          {activeType && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-white rounded-full flex items-center gap-1">
              {CATEGORIES.find((c) => c.key === activeType)?.icon} {activeType}
              <button onClick={() => setActiveType("")} className="ml-0.5 text-white/60 hover:text-white">✕</button>
            </span>
          )}
          {activeSubwayLine && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-green-500 text-white rounded-full flex items-center gap-1">
              🚇 {activeSubwayLine}
              <button onClick={() => setActiveSubwayLine("")} className="ml-0.5 text-white/60 hover:text-white">✕</button>
            </span>
          )}
          {activeDistrict && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-400 text-white rounded-full flex items-center gap-1">
              📍 {activeDistrict}
              <button onClick={() => setActiveDistrict("")} className="ml-0.5 text-white/60 hover:text-white">✕</button>
            </span>
          )}
          {search && (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500 text-white rounded-full flex items-center gap-1">
              🔍 "{search}"
              <button onClick={() => setSearch("")} className="ml-0.5 text-white/60 hover:text-white">✕</button>
            </span>
          )}
          <button
            onClick={() => { setActiveType(""); setActiveDistrict(""); setActiveSubwayLine(""); setSearch("") }}
            className="text-[10px] font-mono text-slate-400 hover:text-red-400 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results Grid */}
      <div ref={resultsRef}>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((loc, i) => (
            <div
              key={loc.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
            >
              <LocationCard location={loc} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-mono text-slate-400">No spots match this filter combination</p>
          <button
            onClick={() => { setActiveType(""); setActiveDistrict(""); setActiveSubwayLine(""); setSearch("") }}
            className="mt-3 pixel-btn px-4 py-2 text-xs bg-white text-slate-600"
          >
            [RESET ALL FILTERS]
          </button>
        </div>
      )}
      </div>

      {/* Footer hint */}
      <div className="text-center mt-10 pb-4">
        <p className="text-xs text-gray-300 font-mono">
          Tip: Search by subway station name (e.g. &quot;弘大入口&quot;) or line (e.g. &quot;2号线&quot;) to find spots along your route.
        </p>
      </div>
    </div>
  )
}
