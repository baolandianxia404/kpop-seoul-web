"use client"

import { useState, useEffect } from "react"

interface PendingSpot {
  locationId: string
  locationName: string
  locationType: string
}

interface Props {
  spotIds: string[]
  onRemove: (id: string) => void
}

export default function PendingSpots({ spotIds, onRemove }: Props) {
  const [spots, setSpots] = useState<PendingSpot[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("kpop_pending_spots") || "[]")
      setSpots(stored.filter((s: PendingSpot) => spotIds.includes(s.locationId)))
    } catch {}
  }, [spotIds])

  if (spots.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">Saved Spots ({spots.length})</label>
        <span className="text-xs text-gray-400">Added from map</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {spots.map((spot) => (
          <span
            key={spot.locationId}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs"
          >
            {spot.locationName}
            <button
              onClick={() => onRemove(spot.locationId)}
              className="text-purple-400 hover:text-purple-600"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
