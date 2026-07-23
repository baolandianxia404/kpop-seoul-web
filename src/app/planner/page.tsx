"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Budget, Preferences } from "@/types"
import { locations, getLocationsByGroupIds } from "@/lib/data/locations"
import { generateFallbackItinerary } from "@/lib/ai/fallback"
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

  const generateLocally = async () => {
    let locs = getLocationsByGroupIds(groupIds)

    // Apply preference filters
    const hasPref = preferences.focusOnCompany || preferences.focusOnRestaurant || preferences.focusOnMvSpot || preferences.focusOnStore
    if (hasPref) {
      locs = locs.filter((l) => {
        if (preferences.focusOnCompany && l.type === "company") return true
        if (preferences.focusOnRestaurant && l.type === "restaurant") return true
        if (preferences.focusOnMvSpot && l.type === "mv_spot") return true
        if (preferences.focusOnStore && l.type === "store") return true
        return false
      })
    }

    const itinerary = generateFallbackItinerary(locs, days, pendingSpotIds)
    itinerary.totalSpots = itinerary.days.reduce((s, d) => s + d.spots.length, 0)
    itinerary.params = { groupIds, days, preferences, budget }
    itinerary.createdAt = new Date().toISOString()

    try {
      const stored = JSON.parse(localStorage.getItem("kpop_itineraries") || "[]")
      const exists = stored.some((s: { title: string }) => s.title === itinerary.title)
      if (!exists) {
        stored.unshift(itinerary)
        localStorage.setItem("kpop_itineraries", JSON.stringify(stored.slice(0, 10)))
      }
    } catch {}

    const encoded = encodeURIComponent(JSON.stringify(itinerary))
    router.push(`/itinerary?data=${encoded}`)
  }

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
        signal: AbortSignal.timeout(10000),
      })

      if (!res.ok) throw new Error("API unavailable")

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || "Generation failed")
      }

      try {
        const stored = JSON.parse(localStorage.getItem("kpop_itineraries") || "[]")
        stored.unshift(data.data.itinerary)
        localStorage.setItem("kpop_itineraries", JSON.stringify(stored.slice(0, 10)))
      } catch {}

      const encoded = encodeURIComponent(JSON.stringify(data.data.itinerary))
      router.push(`/itinerary?data=${encoded}`)
    } catch {
      // API unavailable — use local generator
      try {
        await generateLocally()
      } catch (e) {
        setError("Failed to generate itinerary. Please try again.")
        setLoading(false)
      }
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
        <h1 className="text-2xl font-bold pixel-font text-slate-800">AI Itinerary Planner</h1>
        <p className="text-sm text-slate-400 mt-1 font-mono">
          Select your favorite Kpop groups and let AI plan your Seoul trip
        </p>
      </div>

      <GroupSelector selected={groupIds} onChange={setGroupIds} />

      <DaySelector days={days} onChange={setDays} />

      <PreferencePicker preferences={preferences} onChange={setPreferences} />

      <BudgetSelector budget={budget} onChange={setBudget} />

      <PendingSpots spotIds={pendingSpotIds} onRemove={removePendingSpot} />

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-mono border-2 border-red-200">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || groupIds.length === 0}
        className="w-full py-3 btn-cute text-white font-semibold rounded-xl disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          "✨ Generate Itinerary"
        )}
      </button>

      <p className="text-xs font-mono text-slate-400 text-center">
        AI analyzes location proximity and opening hours to create a smart route.
        <br />
        Works offline with built-in route engine.
      </p>
    </div>
  )
}
