"use client"

import { useMemo } from "react"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import type { ItinerarySpot } from "@/types"

interface Props {
  spots: ItinerarySpot[]
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
  const center: [number, number] = useMemo(() => {
    if (spots.length === 0) return [37.5665, 126.978]
    const avgLat = spots.reduce((s, p) => s + p.lat, 0) / spots.length
    const avgLng = spots.reduce((s, p) => s + p.lng, 0) / spots.length
    return [avgLat, avgLng]
  }, [spots])

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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
