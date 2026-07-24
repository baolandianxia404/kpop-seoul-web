"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Location } from "@/types"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"
import { isFavorite, toggleFavorite } from "@/lib/store/favorites"

const PIXEL_ICONS: Record<string, string> = {
  company: "▣",
  restaurant: "◆",
  mv_spot: "▶",
  store: "◉",
  entertainment: "★",
}

export default function LocationCard({ location }: { location: Location }) {
  const typeInfo = LOCATION_TYPES[location.type]
  const pixelIcon = PIXEL_ICONS[location.type] || "●"
  const [fav, setFav] = useState(false)

  useEffect(() => {
    setFav(isFavorite(location.id))
  }, [location.id])

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFav(toggleFavorite(location.id))
  }

  return (
    <Link
      href={`/locations/${location.id}`}
      className="pixel-card block p-4 bg-white cursor-pointer group"
    >
      {/* Top row: pixel icon + title + rating */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-lg text-white font-mono font-bold"
          style={{ backgroundColor: typeInfo.color, border: "2px solid #1e293b" }}
        >
          {pixelIcon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-slate-800 pixel-font truncate group-hover:text-blue-600 transition-colors">
            {location.name}
          </h3>
          <p className="text-xs text-slate-400 truncate">{location.nameKo}</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1.5">
          <button
            onClick={handleFav}
            className="text-sm hover:scale-110 transition-transform"
            aria-label="Toggle favorite"
          >
            {fav ? "❤️" : "🤍"}
          </button>
          {location.rating && (
            <span className="text-amber-400 text-sm font-mono font-bold">
              ★ {location.rating}
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className="pixel-tag text-white" style={{ backgroundColor: typeInfo.color }}>
          {TYPE_NAME_CN[location.type]}
        </span>
        {location.groupNames.slice(0, 2).map((g) => (
          <span
            key={g}
            className="pixel-tag bg-amber-50 text-amber-700"
            style={{ borderColor: "#d97706" }}
          >
            {g}
          </span>
        ))}
        {location.groupNames.length > 2 && (
          <span className="text-xs font-mono text-slate-400 self-center">
            +{location.groupNames.length - 2}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed font-mono">
        {location.description}
      </p>

      {/* Bottom bar */}
      <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-slate-200">
        <span className="text-xs font-mono text-slate-400">
          📍 {location.location.district}
        </span>
        <span className="text-xs font-mono text-slate-400">
          {location.price.isFree ? "FREE" : location.price.range}
        </span>
      </div>

      {/* Pixel decoration dots */}
      <div className="flex gap-1 mt-2">
        <div className="w-1.5 h-1.5 bg-slate-300" />
        <div className="w-1.5 h-1.5 bg-blue-400" />
        <div className="w-1.5 h-1.5 bg-amber-400" />
        <div className="w-1.5 h-1.5 bg-slate-300" />
      </div>
    </Link>
  )
}
