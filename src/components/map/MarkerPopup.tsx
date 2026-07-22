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
    <div className="bg-white rounded-xl shadow-xl p-4 min-w-[240px] max-w-[300px]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{location.name}</h3>
          <p className="text-xs text-gray-400 truncate">{location.nameKo}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-1">
            ×
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <span
          className="px-2 py-0.5 rounded-full text-xs text-white"
          style={{ backgroundColor: typeInfo.color }}
        >
          {TYPE_NAME_CN[location.type]}
        </span>
        {location.rating && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-50 text-yellow-700">
            ★ {location.rating}
          </span>
        )}
        {distance && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
            {distance}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-1">
        {location.location.district} · {location.location.neighborhood}
      </p>

      {location.description && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {location.description}
        </p>
      )}

      <div className="flex gap-2">
        <Link
          href={`/locations/${location.id}`}
          className="flex-1 py-1.5 px-3 bg-purple-600 text-white text-xs font-medium rounded-lg text-center hover:bg-purple-700"
        >
          View Details
        </Link>
        {onAddToPlan && (
          <button
            onClick={onAddToPlan}
            className="flex-1 py-1.5 px-3 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200"
          >
            Add to Plan
          </button>
        )}
      </div>
    </div>
  )
}
