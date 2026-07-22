"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Itinerary } from "@/types"
import { locations } from "@/lib/data/locations"

export default function SavedPage() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [pendingSpots, setPendingSpots] = useState<
    { locationId: string; locationName: string; locationType: string }[]
  >([])
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [tab, setTab] = useState<"favorites" | "spots" | "itineraries">("favorites")

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("kpop_favorites") || "[]"))
      setPendingSpots(JSON.parse(localStorage.getItem("kpop_pending_spots") || "[]"))
      setItineraries(JSON.parse(localStorage.getItem("kpop_itineraries") || "[]"))
    } catch {}
  }, [])

  const favoriteLocs = locations.filter((l) => favorites.includes(l.id))

  const removeItinerary = (title: string) => {
    const updated = itineraries.filter((i) => i.title !== title)
    setItineraries(updated)
    localStorage.setItem("kpop_itineraries", JSON.stringify(updated))
  }

  const removePending = (id: string) => {
    const updated = pendingSpots.filter((s) => s.locationId !== id)
    setPendingSpots(updated)
    localStorage.setItem("kpop_pending_spots", JSON.stringify(updated))
  }

  const tabs = [
    { key: "favorites" as const, label: "Favorites", count: favoriteLocs.length },
    { key: "spots" as const, label: "Saved Spots", count: pendingSpots.length },
    { key: "itineraries" as const, label: "Itineraries", count: itineraries.length },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">My Collection</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Favorites Tab */}
      {tab === "favorites" && (
        <>
          {favoriteLocs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">⭐</p>
              <p className="text-gray-500 text-sm">No favorites yet</p>
              <Link href="/locations" className="text-purple-600 text-sm mt-2 inline-block">
                Browse locations
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {favoriteLocs.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/locations/${loc.id}`}
                  className="block p-3 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{loc.name}</h3>
                      <p className="text-xs text-gray-400">
                        {loc.location.district} · {loc.type}
                      </p>
                    </div>
                    <span className="text-yellow-500 text-sm">★ {loc.rating}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Saved Spots Tab */}
      {tab === "spots" && (
        <>
          {pendingSpots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📍</p>
              <p className="text-gray-500 text-sm">No saved spots</p>
              <p className="text-xs text-gray-400 mt-1">
                Tap &quot;Add to Plan&quot; on the map to save spots
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingSpots.map((spot) => (
                <div
                  key={spot.locationId}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100"
                >
                  <div>
                    <h3 className="font-semibold text-sm">{spot.locationName}</h3>
                    <p className="text-xs text-gray-400">{spot.locationType}</p>
                  </div>
                  <button
                    onClick={() => removePending(spot.locationId)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Itineraries Tab */}
      {tab === "itineraries" && (
        <>
          {itineraries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🗺</p>
              <p className="text-gray-500 text-sm">No saved itineraries</p>
              <Link href="/planner" className="text-purple-600 text-sm mt-2 inline-block">
                Create your first itinerary
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {itineraries.map((itin) => (
                <div
                  key={itin.title}
                  className="bg-white rounded-xl border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{itin.title}</h3>
                      <p className="text-xs text-gray-400">
                        {itin.days.length} days ·{" "}
                        {itin.totalSpots || itin.days.reduce((s, d) => s + d.spots.length, 0)} spots
                      </p>
                    </div>
                    <button
                      onClick={() => removeItinerary(itin.title)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {itin.days.map((day) => (
                      <span
                        key={day.day}
                        className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs"
                      >
                        Day {day.day}: {day.title}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
