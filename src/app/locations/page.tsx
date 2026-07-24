"use client"

import { useState } from "react"
import { locations } from "@/lib/data/locations"
import { DISTRICTS } from "@/lib/utils/constants"
import LocationCard from "@/components/location/LocationCard"

function getSubwayLines(loc: (typeof locations)[number]): string[] {
  const raw = loc.transport?.subway?.line
  if (!raw) return []
  return raw.split("/").map((s) => s.trim()).filter(Boolean)
}

const ALL_SUBWAY_LINES = [...new Set(locations.flatMap((l) => getSubwayLines(l)))].sort()

export default function LocationsPage() {
  const [district, setDistrict] = useState("")
  const [subway, setSubway] = useState("")

  // Simple inline filter
  let result = [...locations]
  if (district) result = result.filter((l) => l.location.district === district)
  if (subway) result = result.filter((l) => getSubwayLines(l).includes(subway))

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Locations</h1>

      {/* District filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setDistrict("")} className={`px-3 py-1 text-sm rounded ${district === "" ? "bg-black text-white" : "bg-gray-100"}`}>
          All ({locations.length})
        </button>
        {DISTRICTS.map((d) => (
          <button key={d} onClick={() => setDistrict(d)} className={`px-3 py-1 text-sm rounded ${district === d ? "bg-amber-400 text-white" : "bg-gray-100"}`}>
            {d}
          </button>
        ))}
      </div>

      {/* Subway filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setSubway("")} className={`px-3 py-1 text-sm rounded ${subway === "" ? "bg-black text-white" : "bg-gray-100"}`}>
          All
        </button>
        {ALL_SUBWAY_LINES.map((line) => (
          <button key={line} onClick={() => setSubway(line)} className={`px-3 py-1 text-sm rounded ${subway === line ? "bg-green-500 text-white" : "bg-gray-100"}`}>
            {line}
          </button>
        ))}
      </div>

      {/* Status */}
      <p className="mb-4 text-sm text-gray-500">
        district="{district}" subway="{subway}" → {result.length} results
      </p>

      {/* Results — force remount on filter change */}
      <div key={`${district}|${subway}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {result.map((loc, i) => (
          <div key={loc.id} className="p-2 border text-sm">
            <span className="text-gray-400 text-xs">{i + 1}.</span> {loc.name}
            <span className="text-gray-300 text-xs ml-1">— {loc.location.district}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
