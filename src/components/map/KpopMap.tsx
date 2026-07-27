"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import type { Location, LocationType } from "@/types"
import { LOCATION_TYPES, MARKER_COLORS, SEOUL_CENTER, DEFAULT_ZOOM, MAX_MAP_MARKERS } from "@/lib/utils/constants"
import { getVisibleTypes, getVisibleBounds, isInBounds } from "@/lib/utils/filters"
import { getDistance, formatDistance } from "@/lib/utils/distance"
import MapFilterBar from "./MapFilterBar"
import MarkerPopup from "./MarkerPopup"

interface Props {
  locations: Location[]
  flyToLocation?: { lat: number; lng: number; zoom?: number } | null
}

function FlyToHandler({ target, counter }: { target: { lat: number; lng: number; zoom: number }; counter: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([target.lat, target.lng], target.zoom, { duration: 1 })
  }, [counter])
  return null
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

function MapInteractionToggle({ active }: { active: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (active) {
      map.scrollWheelZoom.enable()
      map.dragging.enable()
      map.doubleClickZoom.enable()
      map.touchZoom.enable()
      map.zoomControl?.addTo(map)
    } else {
      map.scrollWheelZoom.disable()
      map.dragging.disable()
      map.doubleClickZoom.disable()
      map.touchZoom.disable()
      map.zoomControl?.remove()
    }
  }, [active, map])
  return null
}

function MapSizeFixer() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 300)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

function ZoomDisplay() {
  const map = useMap()
  const [z, setZ] = useState(map.getZoom())
  useEffect(() => {
    const onZoom = () => setZ(map.getZoom())
    map.on("zoomend", onZoom)
    return () => { map.off("zoomend", onZoom) }
  }, [map])
  return (
    <div className="absolute bottom-2 left-2 z-[2000] bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
      z{z}
    </div>
  )
}

export default function KpopMap({ locations, flyToLocation }: Props) {
  const [mapKey, setMapKey] = useState(0)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [center, setCenter] = useState(SEOUL_CENTER)
  const [activeType, setActiveType] = useState<LocationType | "">("")
  const [activeDistrict, setActiveDistrict] = useState("")
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null)
  const [pendingSpots, setPendingSpots] = useState<string[]>([])
  const [interactive, setInteractive] = useState(false)
  const [flyCounter, setFlyCounter] = useState(0)

  useEffect(() => {
    if (flyToLocation) {
      setInteractive(true)
      setFlyCounter((c) => c + 1)
    }
  }, [flyToLocation])

  const resetMap = useCallback(() => {
    setMapKey((k) => k + 1)
    setActiveType("")
    setActiveDistrict("")
    setSelectedLoc(null)
    setZoom(DEFAULT_ZOOM)
    setCenter(SEOUL_CENTER)
  }, [])

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
        key={mapKey}
        center={[SEOUL_CENTER.lat, SEOUL_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        maxZoom={16}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        doubleClickZoom={false}
        touchZoom={false}
        style={{ width: "100%", height: "100%", touchAction: "manipulation" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="/tiles/{z}/{x}/{y}.png"
          maxZoom={16}
          maxNativeZoom={16}
        />

        <MapEvents onMoveEnd={handleViewportChange} />
        <MapInteractionToggle active={interactive} />
        <MapSizeFixer />
        <ZoomDisplay />
        {flyToLocation && (
          <FlyToHandler
            target={{ lat: flyToLocation.lat, lng: flyToLocation.lng, zoom: flyToLocation.zoom || 16 }}
            counter={flyCounter}
          />
        )}

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

      {/* Click-to-activate overlay */}
      {!interactive && (
        <div
          className="absolute inset-0 z-[900] flex items-center justify-center cursor-pointer group"
          onClick={() => setInteractive(true)}
        >
          <div className="absolute inset-0 bg-white/10 group-hover:bg-white/5 transition-colors" />
          <div className="relative px-4 py-2 bg-white/85 backdrop-blur border-2 border-blue-200 text-blue-400 font-mono text-xs font-bold group-hover:text-blue-500 group-hover:border-blue-400 transition-all animate-bounce-gentle shadow-lg rounded-full">
            👆 Tap to explore
          </div>
        </div>
      )}

      {interactive && (
        <button
          onClick={() => setInteractive(false)}
          className="absolute bottom-6 left-3 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] font-mono text-slate-400 border border-slate-200 hover:text-slate-600 shadow-sm"
        >
          🔒 Lock map
        </button>
      )}

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

      {/* Marker count badge + Reset */}
      <div className="absolute bottom-6 right-3 z-[1000] flex items-center gap-2">
        <button
          onClick={resetMap}
          className="bg-white/90 backdrop-blur px-3 py-2 rounded-full text-xs font-medium text-blue-500 shadow-md border border-blue-50 hover:bg-white transition"
        >
          🔄 Reset
        </button>
        <div className="bg-white/90 backdrop-blur px-3.5 py-2 rounded-full text-xs font-medium text-gray-400 shadow-md border border-blue-50 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          {visibleMarkers.length} spots
        </div>
      </div>
    </div>
  )
}
