"use client"

import { useMemo } from "react"
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps"
import type { ItinerarySpot } from "@/types"

interface Props {
  spots: ItinerarySpot[]
  mapKey: string
}

export default function DayRouteMap({ spots, mapKey }: Props) {
  const center = useMemo(() => {
    if (spots.length === 0) return { lat: 37.5665, lng: 126.978 }
    const avgLat = spots.reduce((s, p) => s + p.lat, 0) / spots.length
    const avgLng = spots.reduce((s, p) => s + p.lng, 0) / spots.length
    return { lat: avgLat, lng: avgLng }
  }, [spots])

  const bounds = useMemo(() => {
    if (spots.length < 2) return undefined
    const lats = spots.map((s) => s.lat)
    const lngs = spots.map((s) => s.lng)
    return {
      north: Math.max(...lats) + 0.01,
      south: Math.min(...lats) - 0.01,
      east: Math.max(...lngs) + 0.01,
      west: Math.min(...lngs) - 0.01,
    }
  }, [spots])

  return (
    <APIProvider apiKey={mapKey}>
      <div className="w-full h-64 rounded-xl overflow-hidden">
        <Map
          mapId="kpop-route-map"
          defaultCenter={center}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI
          style={{ width: "100%", height: "100%" }}
        >
          {spots.map((spot, i) => (
            <AdvancedMarker
              key={`${spot.locationId}-${i}`}
              position={{ lat: spot.lat, lng: spot.lng }}
              title={spot.locationName}
            >
              <div className="flex flex-col items-center" style={{ transform: "translateY(-50%)" }}>
                <div className="w-6 h-6 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow">
                  {i + 1}
                </div>
                <div className="w-1 h-2 bg-purple-600 rounded-b" />
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </div>
    </APIProvider>
  )
}
