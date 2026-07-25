"use client"

import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import type { ItinerarySpot } from "@/types"

interface Props {
  spots: ItinerarySpot[]
}

function MapSizeFixer() {
  const map = useMap()
  useEffect(() => {
    map.whenReady(() => {
      map.invalidateSize()
      // After layout settles, force a view reset to reload all tiles at correct size
      setTimeout(() => {
        map.invalidateSize()
        const c = map.getCenter()
        const z = map.getZoom()
        map.setView(c, z, { animate: false })
      }, 400)
    })
  }, [map])
  return null
}

function getNumIcon(n: number): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-50%)">
      <div style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;background-color:#7c3aed;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);font-size:10px;color:white;font-weight:bold">${n}</div>
      <div style="width:3px;height:6px;border-radius:0 0 3px 3px;background-color:#7c3aed"></div>
    </div>`,
    iconSize: [24, 34],
    iconAnchor: [12, 34],
  })
}

export default function DayRouteMap({ spots }: Props) {
  const [mapKey, setMapKey] = useState(0)

  const center: [number, number] = useMemo(() => {
    if (spots.length === 0) return [37.5665, 126.978]
    const avgLat = spots.reduce((s, p) => s + p.lat, 0) / spots.length
    const avgLng = spots.reduce((s, p) => s + p.lng, 0) / spots.length
    return [avgLat, avgLng]
  }, [spots])

  // Force remount when spots change (same approach as homepage KpopMap)
  useEffect(() => {
    setMapKey((k) => k + 1)
  }, [spots])

  return (
    <div
      className="w-full bg-[#e8f0e8]"
      style={{
        height: "55vh",
        minHeight: "300px",
        maxHeight: "400px",
        border: "2px solid #1e293b",
        boxShadow: "4px 4px 0 0 rgba(0,0,0,0.08)",
      }}
    >
      <MapContainer
        key={mapKey}
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        dragging={true}
        zoomControl={true}
        touchZoom={true}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
        />
        <MapSizeFixer />

        {spots.map((spot, i) => (
          <Marker
            key={`${spot.locationId}-${i}`}
            position={[spot.lat, spot.lng]}
            icon={getNumIcon(i + 1)}
          />
        ))}
      </MapContainer>
    </div>
  )
}
