"use client"

import { useState, useCallback, useMemo } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import type { Location, LocationType } from "@/types"
import { LOCATION_TYPES, MARKER_COLORS, SEOUL_CENTER, DEFAULT_ZOOM, MAX_MAP_MARKERS } from "@/lib/utils/constants"
import { getVisibleTypes, getVisibleBounds, isInBounds } from "@/lib/utils/filters"
import { getDistance, formatDistance } from "@/lib/utils/distance"
import MapFilterBar from "./MapFilterBar"
import MarkerPopup from "./MarkerPopup"

interface Props {
  locations: Location[]
}

const iconCache: Record<string, L.DivIcon> = {}

function getMarkerIcon(type: LocationType): L.DivIcon {
  if (iconCache[type]) return iconCache[type]
  const color = MARKER_COLORS[type]
  const emoji = LOCATION_TYPES[type].icon
  iconCache[type] = L.divIcon({
    className: "kpop-marker",
    html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-50%);cursor:pointer;filter:drop-shadow(0 3px 4px rgba(0,0,0,0.2));transition:transform 0.15s ease">
      <div style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:white;border:3px solid ${color};box-shadow:0 2px 8px rgba(0,0,0,0.12);font-size:15px">${emoji}</div>
      <div style="width:6px;height:6px;border-radius:50%;background-color:${color};margin-top:-1px"></div>
    </div>`,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
  })
  return iconCache[type]
}

function MapEvents({ onMoveEnd }: { onMoveEnd: (center: { lat: number; lng: number }, zoom: number) => void }) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target
      const c = map.getCenter()
      onMoveEnd({ lat: c.lat, lng: c.lng }, map.getZoom())
    },
  })
  return null
}

export default function KpopMap({ locations }: Props) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [center, setCenter] = useState(SEOUL_CENTER)
  const [activeType, setActiveType] = useState<LocationType | "">("")
  const [activeDistrict, setActiveDistrict] = useState("")
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null)
  const [pendingSpots, setPendingSpots] = useState<string[]>([])

  const handleViewportChange = useCallback(
    (newCenter: { lat: number; lng: number }, newZoom: number) => {
      setCenter(newCenter)
      setZoom(newZoom)
    },
    []
  )

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

    filtered.sort(
      (a, b) =>
        getDistance(center.lat, center.lng, a.location.latitude, a.location.longitude) -
        getDistance(center.lat, center.lng, b.location.latitude, b.location.longitude)
    )

    return filtered
  }, [locations, zoom, center, activeType, activeDistrict])

  const addToPlan = useCallback((loc: Location) => {
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
  }, [])

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[SEOUL_CENTER.lat, SEOUL_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents onMoveEnd={handleViewportChange} />

        {visibleMarkers.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.location.latitude, loc.location.longitude]}
            icon={getMarkerIcon(loc.type)}
            eventHandlers={{
              click: () => setSelectedLoc(loc),
            }}
          />
        ))}
      </MapContainer>

      {/* Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000]">
        <MapFilterBar
          activeType={activeType}
          activeDistrict={activeDistrict}
          onTypeChange={setActiveType}
          onDistrictChange={setActiveDistrict}
        />
      </div>

      {/* Marker Popup */}
      {selectedLoc && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000]">
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
      <div className="absolute bottom-6 right-3 z-[1000]">
        <div className="bg-white/90 backdrop-blur px-3.5 py-2 rounded-full text-xs font-medium text-gray-400 shadow-md border border-blue-50 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          {visibleMarkers.length} spots
        </div>
      </div>
    </div>
  )
}
