"use client"

import { useState, useCallback, useMemo } from "react"
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps"
import type { Location, LocationType } from "@/types"
import type { MapCameraChangedEvent } from "@vis.gl/react-google-maps"
import { LOCATION_TYPES, MARKER_COLORS, SEOUL_CENTER, DEFAULT_ZOOM, MAX_MAP_MARKERS } from "@/lib/utils/constants"
import { getVisibleTypes, getVisibleBounds, isInBounds } from "@/lib/utils/filters"
import { getDistance, formatDistance } from "@/lib/utils/distance"
import MapFilterBar from "./MapFilterBar"
import MarkerPopup from "./MarkerPopup"

interface Props {
  locations: Location[]
  mapKey: string
}

export default function KpopMap({ locations, mapKey }: Props) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [center, setCenter] = useState(SEOUL_CENTER)
  const [activeType, setActiveType] = useState<LocationType | "">("")
  const [activeDistrict, setActiveDistrict] = useState("")
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null)
  const [pendingSpots, setPendingSpots] = useState<string[]>([])

  // Filter and compute visible markers
  const visibleMarkers = useMemo(() => {
    const visibleTypes = getVisibleTypes(zoom)
    const bounds = getVisibleBounds(center, zoom)

    let filtered = locations

    if (activeType) {
      filtered = filtered.filter((l) => l.type === activeType)
    }
    if (activeDistrict) {
      filtered = filtered.filter((l) => l.location.district === activeDistrict)
    }
    if (visibleTypes) {
      filtered = filtered.filter((l) => visibleTypes.includes(l.type))
    }
    filtered = filtered.filter((l) => isInBounds(l, bounds))

    if (filtered.length > MAX_MAP_MARKERS) {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      filtered = filtered.slice(0, MAX_MAP_MARKERS)
    }

    // Sort by distance from center for better visual distribution
    filtered.sort(
      (a, b) =>
        getDistance(center.lat, center.lng, a.location.latitude, a.location.longitude) -
        getDistance(center.lat, center.lng, b.location.latitude, b.location.longitude)
    )

    return filtered
  }, [locations, zoom, center, activeType, activeDistrict])

  const handleBoundsChanged = useCallback(
    (e: MapCameraChangedEvent) => {
      if (e.detail.center && e.detail.zoom != null) {
        setCenter({ lat: e.detail.center.lat, lng: e.detail.center.lng })
        setZoom(e.detail.zoom)
      }
    },
    []
  )

  const addToPlan = (loc: Location) => {
    setPendingSpots((prev) => [...prev, loc.id])
    try {
      const stored = JSON.parse(localStorage.getItem("kpop_pending_spots") || "[]")
      if (!stored.some((s: { locationId: string }) => s.locationId === loc.id)) {
        stored.push({
          locationId: loc.id,
          locationName: loc.name,
          locationType: loc.type,
        })
        localStorage.setItem("kpop_pending_spots", JSON.stringify(stored))
      }
    } catch {}
    setSelectedLoc(null)
  }

  return (
    <APIProvider apiKey={mapKey}>
      <div className="relative w-full h-full">
        <Map
          mapId="kpop-seoul-map"
          defaultCenter={SEOUL_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI={false}
          onBoundsChanged={handleBoundsChanged}
          style={{ width: "100%", height: "100%" }}
        >
          {visibleMarkers.map((loc) => (
            <AdvancedMarker
              key={loc.id}
              position={{ lat: loc.location.latitude, lng: loc.location.longitude }}
              onClick={() => setSelectedLoc(loc)}
              title={loc.name}
            >
              <div
                className="flex flex-col items-center cursor-pointer group"
                style={{ transform: "translateY(-50%)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white text-xs font-bold text-white group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: MARKER_COLORS[loc.type] }}
                >
                  {LOCATION_TYPES[loc.type].icon}
                </div>
                <div
                  className="w-1 h-2 rounded-b"
                  style={{ backgroundColor: MARKER_COLORS[loc.type] }}
                />
              </div>
            </AdvancedMarker>
          ))}
        </Map>

        {/* Filter Bar */}
        <div className="absolute top-3 left-3 right-3 z-10">
          <MapFilterBar
            activeType={activeType}
            activeDistrict={activeDistrict}
            onTypeChange={setActiveType}
            onDistrictChange={setActiveDistrict}
          />
        </div>

        {/* Marker Popup */}
        {selectedLoc && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
            <MarkerPopup
              location={selectedLoc}
              distance={formatDistance(
                getDistance(
                  center.lat,
                  center.lng,
                  selectedLoc.location.latitude,
                  selectedLoc.location.longitude
                )
              )}
              onAddToPlan={() => addToPlan(selectedLoc)}
              onClose={() => setSelectedLoc(null)}
            />
          </div>
        )}

        {/* Marker count badge */}
        <div className="absolute bottom-6 right-3 z-10">
          <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs text-gray-500 shadow">
            {visibleMarkers.length} markers shown
          </div>
        </div>
      </div>
    </APIProvider>
  )
}
