"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import type { Itinerary } from "@/types"
import DayTabs from "@/components/itinerary/DayTabs"
import ItineraryTimeline from "@/components/itinerary/ItineraryTimeline"

const DayRouteMap = dynamic(() => import("@/components/itinerary/DayRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
      <p className="text-sm text-gray-400">Loading map...</p>
    </div>
  ),
})

function ItineraryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [activeDay, setActiveDay] = useState(0)
  const [error, setError] = useState("")

  
  useEffect(() => {
    const dataParam = searchParams.get("data")
    if (dataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(dataParam))
        setItinerary(parsed)

        // Also save to localStorage
        try {
          const stored = JSON.parse(localStorage.getItem("kpop_itineraries") || "[]")
          const exists = stored.some(
            (s: Itinerary) => s.title === parsed.title
          )
          if (!exists) {
            stored.unshift(parsed)
            localStorage.setItem("kpop_itineraries", JSON.stringify(stored.slice(0, 10)))
          }
        } catch {}
      } catch {
        setError("Failed to load itinerary data")
      }
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => router.push("/planner")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
        >
          Back to Planner
        </button>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading itinerary...</p>
      </div>
    )
  }

  const currentDay = itinerary.days[activeDay]
  const dayTitles = itinerary.days.map((d) => d.title)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{itinerary.title}</h1>
          <p className="text-sm text-gray-500">
            {itinerary.days.length} days · {itinerary.totalSpots || itinerary.days.reduce((s, d) => s + d.spots.length, 0)} spots
          </p>
        </div>
        <button
          onClick={() => router.push("/planner")}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          New Plan
        </button>
      </div>

      <DayTabs
        activeDay={activeDay}
        totalDays={itinerary.days.length}
        dayTitles={dayTitles}
        onChange={setActiveDay}
      />

      {currentDay && (
        <>
          <div className="bg-blue-50 rounded-xl p-4">
            <h2 className="font-semibold text-sm text-blue-900">
              Day {currentDay.day}: {currentDay.title}
            </h2>
            <p className="text-xs text-blue-600 mt-1">{currentDay.description}</p>
          </div>

          <DayRouteMap spots={currentDay.spots} />

          <ItineraryTimeline spots={currentDay.spots} />
        </>
      )}
    </div>
  )
}

export default function ItineraryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <ItineraryContent />
    </Suspense>
  )
}
