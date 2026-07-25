"use client"

import { useState, useMemo, useEffect } from "react"
import { locations } from "@/lib/data/locations"
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

const DISTRICT_PALETTE = [
  { bg: "#eff6ff", border: "#3b82f6", shadow: "#bfdbfe", dot: "#60a5fa" },
  { bg: "#fef3c7", border: "#f59e0b", shadow: "#fde68a", dot: "#fbbf24" },
  { bg: "#fce7f3", border: "#ec4899", shadow: "#fbcfe8", dot: "#f472b6" },
  { bg: "#d1fae5", border: "#10b981", shadow: "#a7f3d0", dot: "#34d399" },
  { bg: "#ede9fe", border: "#8b5cf6", shadow: "#c4b5fd", dot: "#a78bfa" },
  { bg: "#fff7ed", border: "#f97316", shadow: "#fed7aa", dot: "#fb923c" },
  { bg: "#f0fdf4", border: "#22c55e", shadow: "#bbf7d0", dot: "#4ade80" },
  { bg: "#fdf2f8", border: "#db2777", shadow: "#fce7f3", dot: "#f472b6" },
  { bg: "#ecfeff", border: "#06b6d4", shadow: "#cffafe", dot: "#22d3ee" },
  { bg: "#fefce8", border: "#eab308", shadow: "#fef08a", dot: "#facc15" },
  { bg: "#f5f3ff", border: "#7c3aed", shadow: "#ddd6fe", dot: "#8b5cf6" },
]

const SNAP_ICONS = ["🏢", "🍽️", "🎬", "🛍️", "🎡", "🎤"]

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
        <h1 className="text-2xl font-bold pixel-font text-slate-800">
          {t("locations_title")}
        </h1>
        <p className="text-sm text-slate-400 mt-1 font-mono">
          {locations.length} 个地点 · {grouped.length} 个区域
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative pixel-border-dashed bg-white">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-slate-800 text-white text-xs font-mono hover:bg-slate-600 transition"
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
              className={`px-3 py-1.5 text-xs font-mono font-bold transition min-h-[36px] ${
                activeType === key
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
              style={{
                border: "2px solid #1e293b",
                borderRadius: 0,
                boxShadow: activeType === key
                  ? "1px 1px 0 0 #475569"
                  : "2px 2px 0 0 #cbd5e1",
              }}
            >
              {icon} {key === "" ? t("locations_filter_all") : label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 text-xs flex-shrink-0 ml-2">
          <button
            onClick={() => setSortBy("rating")}
            className="pixel-btn px-2.5 py-1.5 text-xs"
            style={{
              backgroundColor: sortBy === "rating" ? "#fef3c7" : "#fff",
              color: sortBy === "rating" ? "#92400e" : "#94a3b8",
            }}
          >
            ★ 评分
          </button>
          <button
            onClick={() => setSortBy("name")}
            className="pixel-btn px-2.5 py-1.5 text-xs"
            style={{
              backgroundColor: sortBy === "name" ? "#dbeafe" : "#fff",
              color: sortBy === "name" ? "#1e40af" : "#94a3b8",
            }}
          >
            A-Z
          </button>
        </div>
      </div>

      {/* Summary */}
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

      {/* District Cards */}
      {mounted && grouped.length > 0 && (
        <div className="space-y-4">
          {grouped.map(([district, locs], i) => {
            const palette = DISTRICT_PALETTE[i % DISTRICT_PALETTE.length]
            const isExpanded = expandedDistricts.has(district)

            // Top groups in this district
            const topGroups = [...new Set(locs.flatMap((l) => l.groupNames))].slice(0, 4)

            // Type breakdown for preview chips
            const typeCounts: Record<string, number> = {}
            for (const l of locs) {
              typeCounts[l.type] = (typeCounts[l.type] || 0) + 1
            }

            return (
              <div
                key={district}
                className="relative transition-all duration-200"
                style={{
                  border: "3px solid #1e293b",
                  borderRadius: 0,
                  backgroundColor: palette.bg,
                  boxShadow: isExpanded
                    ? `4px 4px 0 0 ${palette.shadow}, 8px 8px 0 0 rgba(0,0,0,0.06)`
                    : `4px 4px 0 0 ${palette.shadow}, 6px 6px 0 0 rgba(0,0,0,0.04)`,
                  ...(isExpanded ? {} : {}),
                }}
              >
                {/* Pixel corner accents */}
                <div className="absolute top-0 left-0 w-2.5 h-2.5" style={{ backgroundColor: palette.dot }} />
                <div className="absolute top-0 right-0 w-2.5 h-2.5" style={{ backgroundColor: palette.dot, opacity: 0.6 }} />
                <div className="absolute bottom-0 left-0 w-2.5 h-2.5" style={{ backgroundColor: palette.dot, opacity: 0.5 }} />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5" style={{ backgroundColor: palette.dot }} />

                {/* Inner decorative dots row */}
                <div className="absolute top-1.5 right-3 flex gap-1">
                  <span className="w-1 h-1" style={{ backgroundColor: palette.border, opacity: 0.3 }} />
                  <span className="w-1 h-1" style={{ backgroundColor: palette.border, opacity: 0.5 }} />
                  <span className="w-1 h-1" style={{ backgroundColor: palette.border, opacity: 0.3 }} />
                </div>

                {/* Clickable header */}
                <button
                  onClick={() => toggleDistrict(district)}
                  className="w-full text-left px-5 py-4 hover:brightness-[0.98] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* District name row */}
                      <div className="flex items-center gap-3 mb-1.5">
                        <div
                          className="w-8 h-8 flex items-center justify-center text-white text-xs font-mono font-bold flex-shrink-0"
                          style={{
                            backgroundColor: palette.border,
                            border: "2px solid #1e293b",
                          }}
                        >
                          {SNAP_ICONS[i % SNAP_ICONS.length]}
                        </div>
                        <span className="text-lg font-bold pixel-font text-slate-800">
                          {district}
                        </span>
                        <span
                          className="px-2 py-0.5 text-xs font-mono font-bold flex-shrink-0"
                          style={{
                            backgroundColor: "#1e293b",
                            color: "#fff",
                          }}
                        >
                          {locs.length}
                        </span>
                      </div>

                      {/* Preview: groups + types */}
                      <div className="flex items-center gap-2 flex-wrap ml-11">
                        {topGroups.map((g) => (
                          <span
                            key={g}
                            className="text-[10px] font-mono text-slate-500"
                            style={{
                              borderBottom: `2px solid ${palette.shadow}`,
                            }}
                          >
                            {g}
                          </span>
                        ))}
                        <span className="text-[10px] text-slate-300 font-mono">
                          {Object.entries(typeCounts).slice(0, 3).map(([t, c]) => `${t}×${c}`).join(" · ")}
                        </span>
                      </div>
                    </div>

                    {/* Expand arrow */}
                    <div
                      className="w-7 h-7 flex items-center justify-center flex-shrink-0 ml-3 transition-transform duration-200"
                      style={{
                        border: "2px solid #1e293b",
                        backgroundColor: "#fff",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      <span className="text-xs font-mono font-bold text-slate-600">▼</span>
                    </div>
                  </div>
                </button>

                {/* Expanded location grid */}
                {isExpanded && (
                  <div
                    className="px-5 pb-5 pt-1"
                    style={{
                      borderTop: "2px dashed #1e293b",
                    }}
                  >
                    <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-up">
                      {locs.map((loc) => (
                        <LocationCard key={loc.id} location={loc} />
                      ))}
                    </div>

                    {/* Footer pixel bar */}
                    <div className="flex gap-1 mt-4">
                      {[...Array(8)].map((_, j) => (
                        <div
                          key={j}
                          className="flex-1 h-1"
                          style={{
                            backgroundColor: j % 2 === 0 ? palette.shadow : palette.border,
                            opacity: 0.5 + (j % 3) * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Empty */}
      {mounted && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-mono text-slate-400">没有找到匹配的地点</p>
          <button
            onClick={() => { setActiveType(""); setSearch("") }}
            className="mt-3 pixel-btn px-4 py-2 text-xs bg-white text-slate-600"
          >
            [清除筛选]
          </button>
        </div>
      )}

      {/* Skeleton */}
      {!mounted && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-5 animate-pulse"
              style={{ border: "3px solid #e2e8f0", backgroundColor: "#f8fafc" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200" />
                <div className="h-5 w-24 bg-slate-200" />
                <div className="h-5 w-8 bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
