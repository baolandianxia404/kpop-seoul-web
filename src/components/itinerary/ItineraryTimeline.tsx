"use client"

import type { ItinerarySpot } from "@/types"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"
import TransportBadge from "./TransportBadge"

interface Props {
  spots: ItinerarySpot[]
}

export default function ItineraryTimeline({ spots }: Props) {
  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-purple-100" />

      <div className="space-y-4">
        {spots.map((spot, i) => {
          const typeInfo = LOCATION_TYPES[spot.locationType]
          return (
            <div key={`${spot.locationId}-${i}`} className="relative">
              {/* Timeline dot */}
              <div
                className="absolute -left-[22px] top-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow"
                style={{ backgroundColor: typeInfo?.color || "#7c3aed" }}
              >
                {i + 1}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-semibold text-sm">{spot.locationName}</h4>
                    <p className="text-xs text-gray-400">{TYPE_NAME_CN[spot.locationType]}</p>
                  </div>
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    {spot.estimatedArrival}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span>⏱ {spot.estimatedDuration}min</span>
                  {spot.note && <span>· {spot.note}</span>}
                </div>

                {spot.nextTransport && (
                  <div className="mt-2 pt-2 border-t border-gray-50">
                    <TransportBadge transport={spot.nextTransport} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
