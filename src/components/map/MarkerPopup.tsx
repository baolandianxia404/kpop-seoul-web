"use client"

import Link from "next/link"
import type { Location } from "@/types"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"

interface Props {
  location: Location
  distance?: string
  onAddToPlan?: () => void
  onClose?: () => void
}

export default function MarkerPopup({ location, distance, onAddToPlan, onClose }: Props) {
  const typeInfo = LOCATION_TYPES[location.type]

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-4 w-[calc(100vw-32px)] max-w-[340px] animate-pop-in border border-blue-50">
      {/* Gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl gradient-cute" />

      <div className="flex items-start justify-between mb-2 mt-0.5">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate text-gray-800">{location.name}</h3>
          <p className="text-xs text-gray-400 truncate">{location.nameKo}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 text-sm transition ml-1 flex-shrink-0"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium text-white shadow-sm"
          style={{ backgroundColor: typeInfo.color }}
        >
          {typeInfo.icon} {TYPE_NAME_CN[location.type]}
        </span>
        {location.rating && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
            ⭐ {location.rating}
          </span>
        )}
        {distance && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
            📍 {distance}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-1">
        {location.location.district} · {location.location.neighborhood}
      </p>

      {location.transport.subway && (
        <p className="text-[10px] text-gray-400 mb-2 font-mono">
          🚇 {location.transport.subway.station} Exit {location.transport.subway.exit} · {location.transport.subway.walkingMinutes}min walk
        </p>
      )}

      {location.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {location.description}
        </p>
      )}

      <div className="flex gap-2">
        <Link
          href={`/locations/${location.id}`}
          className="flex-1 py-2 px-3 btn-cute text-xs font-semibold rounded-xl text-center"
        >
          💜 View Details
        </Link>
        {onAddToPlan && (
          <button
            onClick={onAddToPlan}
            className="flex-1 py-2 px-3 bg-amber-50 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-100 border border-amber-200 transition-all duration-200 hover:shadow-sm"
          >
            ⭐ Add to Plan
          </button>
        )}
      </div>
    </div>
  )
}
