"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { locations } from "@/lib/data/locations"
import { LOCATION_TYPES, TYPE_NAME_CN, DISTRICTS } from "@/lib/utils/constants"
import LocationCard from "@/components/location/LocationCard"
import type { LocationType } from "@/types"
import { useLang } from "@/components/LanguageProvider"

const CATEGORIES: { key: LocationType | ""; label: string; icon: string; pixel: string; translationKey?: string }[] = [
  { key: "", label: "ALL", icon: "🌟", pixel: "◈", translationKey: "locations_filter_all" },
  { key: "company", label: "公司", icon: "🏢", pixel: "▣" },
  { key: "restaurant", label: "美食", icon: "🍽️", pixel: "◆" },
  { key: "mv_spot", label: "MV", icon: "🎬", pixel: "▶" },
  { key: "store", label: "周边", icon: "🛍️", pixel: "◉" },
  { key: "entertainment", label: "娱乐", icon: "🎡", pixel: "★" },
]

export default function LocationsPage() {
  const { t } = useLang()
  const [activeType, setActiveType] = useState<LocationType | "">("")
  const [activeDistrict, setActiveDistrict] = useState("")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating")

  const filtered = useMemo(() => {
    let result = [...locations]

    if (activeType) result = result.filter((l) => l.type === activeType)
    if (activeDistrict) result = result.filter((l) => l.location.district === activeDistrict)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.nameKo.includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.groupNames.some((g) => g.toLowerCase().includes(q))
      )
    }

    if (sortBy === "rating") result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else result.sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [activeType, activeDistrict, search, sortBy])

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
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {CATEGORIES.map(({ key, label, icon, pixel, translationKey }) => (
          <button
            key={key}
            onClick={() => setActiveType(key)}
            className={`pixel-btn px-3 py-2.5 md:py-2 text-xs flex items-center gap-1 min-h-[44px] md:min-h-0 ${
              activeType === key
                ? "bg-slate-800 text-white active"
                : "bg-white text-slate-600 hover:bg-amber-50"
            }`}
          >
            <span className="text-sm">{icon}</span>
            <span className="hidden sm:inline">{pixel}</span>
            {translationKey ? t(translationKey as "locations_filter_all") : label}
          </button>
        ))}
      </div>

      {/* District Filter */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-4 pb-1">
        <button
          onClick={() => setActiveDistrict("")}
          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-mono transition ${
            activeDistrict === ""
              ? "bg-blue-500 text-white"
              : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          {t("locations_filter_all")}
        </button>
        {DISTRICTS.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDistrict(d)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-mono transition ${
              activeDistrict === d
                ? "bg-amber-400 text-white"
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Sort + Results count */}
      <div className="flex items-center justify-between mb-4 text-xs font-mono text-slate-400">
        <span>
          {filtered.length} / {locations.length} SPOTS
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

      {/* Results Grid */}
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
          <p className="font-mono text-slate-400">NO_SPOTS_FOUND...</p>
          <button
            onClick={() => { setActiveType(""); setActiveDistrict(""); setSearch("") }}
            className="mt-3 pixel-btn px-4 py-2 text-xs bg-white text-slate-600"
          >
            [RESET_FILTERS]
          </button>
        </div>
      )}
    </div>
  )
}
