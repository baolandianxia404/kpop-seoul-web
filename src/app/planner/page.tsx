"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Budget, Preferences } from "@/types"
import GroupSelector from "@/components/planner/GroupSelector"
import DaySelector from "@/components/planner/DaySelector"
import PreferencePicker from "@/components/planner/PreferencePicker"
import BudgetSelector from "@/components/planner/BudgetSelector"
import PendingSpots from "@/components/planner/PendingSpots"

export default function PlannerPage() {
  const router = useRouter()
  const [groupIds, setGroupIds] = useState<string[]>([])
  const [days, setDays] = useState(2)
  const [preferences, setPreferences] = useState<Preferences>({
    focusOnCompany: false,
    focusOnRestaurant: false,
    focusOnMvSpot: false,
    focusOnStore: false,
  })
  const [budget, setBudget] = useState<Budget>("medium")
  const [pendingSpotIds, setPendingSpotIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("kpop_pending_spots") || "[]")
      setPendingSpotIds(stored.map((s: { locationId: string }) => s.locationId))
    } catch {}
  }, [])

  const handleSubmit = async () => {
    if (groupIds.length === 0) {
      setError("Please select at least one group")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupIds, days, preferences, budget, pendingSpotIds }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Generation failed")
        setLoading(false)
        return
      }

      // Save itinerary to localStorage and navigate
      try {
        const stored = JSON.parse(localStorage.getItem("kpop_itineraries") || "[]")
        stored.unshift(data.data.itinerary)
        localStorage.setItem("kpop_itineraries", JSON.stringify(stored.slice(0, 10)))
      } catch {}

      // Navigate to itinerary with data via URL param
      const encoded = encodeURIComponent(JSON.stringify(data.data.itinerary))
      router.push(`/itinerary?data=${encoded}`)
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  const removePendingSpot = (id: string) => {
    setPendingSpotIds((prev) => prev.filter((s) => s !== id))
    try {
      const stored = JSON.parse(localStorage.getItem("kpop_pending_spots") || "[]")
      localStorage.setItem(
        "kpop_pending_spots",
        JSON.stringify(stored.filter((s: { locationId: string }) => s.locationId !== id))
      )
    } catch {}
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Itinerary Planner</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select your favorite Kpop groups and let AI plan your Seoul trip
        </p>
      </div>

      <GroupSelector selected={groupIds} onChange={setGroupIds} />

      <DaySelector days={days} onChange={setDays} />

      <PreferencePicker preferences={preferences} onChange={setPreferences} />

      <BudgetSelector budget={budget} onChange={setBudget} />

      <PendingSpots spotIds={pendingSpotIds} onRemove={removePendingSpot} />

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || groupIds.length === 0}
        className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Itinerary"
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        AI analyzes location proximity and opening hours to create a smart route.
        <br />
        Free tier: DeepSeek AI, 5 generations per day.
      </p>
    </div>
  )
}
