"use client"

import { useState, useMemo, useEffect } from "react"
import { locations } from "@/lib/data/locations"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"
import LocationCard from "@/components/location/LocationCard"
import type { LocationType } from "@/types"
import { useLang } from "@/components/LanguageProvider"

const CATEGORIES: { key: LocationType | ""; label: string; icon: string }[] = [
  { key: "", label: "ALL", icon: "🌟" },
  { key: "company", label: "公司", icon: "🏢" },
  { key: "restaurant", label: "美食", icon: "🍽️" },
  { key: "mv_spot", label: "MV", icon: "🎬" },
  { key: "store", label: "周边", icon: "🛍️" },
  { key: "entertainment", label: "娱乐", icon: "🎡" },
  { key: "concert", label: "演唱会", icon: "🎤" },
]

export default function LocationsPage() {
  const { t } = useLang()
  const [activeType, setActiveType] = useState<LocationType | "">("")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating")
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const filtered = useMemo(() => {
    let result = [...locations]

    if (activeType) result = result.filter((l) => l.type === activeType)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.nameKo.includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.groupNames.some((g) => g.toLowerCase().includes(q)) ||
          l.transport?.subway?.station?.toLowerCase().includes(q) ||
          l.location.district.toLowerCase().includes(q)
      )
    }

    if (sortBy === "rating") result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else result.sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [activeType, search, sortBy])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {}
    for (const loc of filtered) {
      const d = loc.location.district
      if (!groups[d]) groups[d] = []
      groups[d].push(loc)
    }
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
  }, [filtered])

  const hasActiveFilters = !!(activeType || search)

  // Auto-expand all when filtering, collapse all when not
  useEffect(() => {
    if (!mounted) return
    if (hasActiveFilters) {
      setExpandedDistricts(new Set(grouped.map(([d]) => d)))
    } else {
      setExpandedDistricts(new Set())
    }
  }, [hasActiveFilters, mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDistrict = (district: string) => {
    setExpandedDistricts((prev) => {
      const next = new Set(prev)
      if (next.has(district)) next.delete(district)
      else next.add(district)
      return next
    })
  }

  const expandAll = () => setExpandedDistricts(new Set(grouped.map(([d]) => d)))
  const collapseAll = () => setExpandedDistricts(new Set())

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-3xl mb-2">🗺️</p>
        <h1 className="text-2xl font-bold text-slate-800">{t("locations_title")}</h1>
        <p className="text-sm text-slate-400 mt-1 font-mono">
          {locations.length} 个地点 · {grouped.length} 个区域
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative bg-white rounded-xl border-2 border-slate-200 focus-within:border-blue-400 transition">
          <input
            type="text"
            placeholder={t("locations_search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 text-sm font-mono bg-transparent outline-none text-slate-700 placeholder:text-slate-300"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 font-mono text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category + Sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition min-h-[36px] ${
                activeType === key
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {icon} {key === "" ? t("locations_filter_all") : label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 text-xs flex-shrink-0 ml-2">
          <button
            onClick={() => setSortBy("rating")}
            className={`px-2 py-1 rounded ${sortBy === "rating" ? "bg-amber-100 text-amber-700 font-bold" : "text-slate-400"}`}
          >
            ★ 评分
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-2 py-1 rounded ${sortBy === "name" ? "bg-blue-100 text-blue-700 font-bold" : "text-slate-400"}`}
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Results summary + expand/collapse */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 font-mono">
          共 <span className="font-bold text-slate-600">{filtered.length}</span> 个地点
          {hasActiveFilters && " (筛选后)"}
        </span>
        {grouped.length > 0 && (
          <div className="flex gap-2 text-xs font-mono">
            <button onClick={expandAll} className="text-blue-500 hover:underline">展开全部</button>
            <button onClick={collapseAll} className="text-slate-400 hover:underline">收起全部</button>
        </div>
        )}
      </div>

      {/* District Accordion */}
      {mounted && grouped.length > 0 && (
        <div className="space-y-2">
          {grouped.map(([district, locs]) => {
            const isExpanded = expandedDistricts.has(district)
            // Show a preview chip of top groups in this district
            const topGroups = [...new Set(locs.flatMap((l) => l.groupNames))].slice(0, 3)

            return (
              <div
                key={district}
                className="bg-white rounded-xl border-2 border-slate-100 overflow-hidden hover:border-slate-200 transition-colors"
              >
                <button
                  onClick={() => toggleDistrict(district)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/50 transition min-h-[48px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg flex-shrink-0">📍</span>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{district}</span>
                        <span className="text-xs text-slate-400 font-mono">{locs.length}</span>
                      </div>
                      {!isExpanded && topGroups.length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {topGroups.map((g) => (
                            <span key={g} className="text-[10px] text-slate-300 font-mono truncate">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-slate-300 text-xs flex-shrink-0 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-up">
                    {locs.map((loc) => (
                      <LocationCard key={loc.id} location={loc} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {mounted && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-mono text-slate-400">没有找到匹配的地点</p>
          <button
            onClick={() => { setActiveType(""); setSearch("") }}
            className="mt-3 text-sm text-blue-500 underline font-mono"
          >
            清除筛选条件
          </button>
        </div>
      )}

      {!mounted && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border-2 border-slate-100 p-4 animate-pulse">
              <div className="h-5 w-32 bg-slate-100 rounded mb-2" />
              <div className="h-3 w-48 bg-slate-50 rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
