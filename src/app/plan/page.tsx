"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Budget, Preferences } from "@/types"
import GroupSelector from "@/components/planner/GroupSelector"
import DaySelector from "@/components/planner/DaySelector"
import BudgetSelector from "@/components/planner/BudgetSelector"
import PreferencePicker from "@/components/planner/PreferencePicker"
import PendingSpots from "@/components/planner/PendingSpots"
import { getPendingSpots, removePendingSpot } from "@/lib/store/pending-spots"
import { getLocationsByGroupIds } from "@/lib/data/locations"
import { generateFallbackItinerary } from "@/lib/ai/fallback"
import { useLang } from "@/components/LanguageProvider"

export default function PlanPage() {
  const router = useRouter()
  const { t } = useLang()

  const [groupIds, setGroupIds] = useState<string[]>([])
  const [days, setDays] = useState(2)
  const [budget, setBudget] = useState<Budget>("medium")
  const [preferences, setPreferences] = useState<Preferences>({
    focusOnCompany: false,
    focusOnRestaurant: false,
    focusOnMvSpot: false,
    focusOnStore: false,
  })
  const [pendingSpotIds, setPendingSpotIds] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    setMounted(true)
    setPendingSpotIds(getPendingSpots().map((s) => s.locationId))
  }, [])

  const handleRemoveSpot = (id: string) => {
    removePendingSpot(id)
    setPendingSpotIds((prev) => prev.filter((sid) => sid !== id))
  }

  const handleGenerate = () => {
    if (groupIds.length === 0) {
      setErrorMsg(t("plan_error_no_group") || "Please select at least one group.")
      return
    }

    const locations = getLocationsByGroupIds(groupIds)

    if (locations.length === 0) {
      setErrorMsg("No locations found for selected groups. Please try other groups.")
      return
    }

    // Use preferences to filter/sort locations
    let filtered = [...locations]
    const { focusOnCompany, focusOnRestaurant, focusOnMvSpot, focusOnStore } = preferences
    const hasPref = focusOnCompany || focusOnRestaurant || focusOnMvSpot || focusOnStore
    if (hasPref) {
      filtered = filtered.filter((l) => {
        if (focusOnCompany && l.type === "company") return true
        if (focusOnRestaurant && l.type === "restaurant") return true
        if (focusOnMvSpot && l.type === "mv_spot") return true
        if (focusOnStore && l.type === "store") return true
        return false
      })
      // If filtering removed everything, fall back to all
      if (filtered.length === 0) filtered = [...locations]
    }

    const itinerary = generateFallbackItinerary(filtered, days, pendingSpotIds)
    itinerary.title = `Kpop Seoul ${days}-Day Tour`
    const totalSpots = itinerary.days.reduce((sum, d) => sum + d.spots.length, 0)
    const encoded = encodeURIComponent(
      JSON.stringify({
        ...itinerary,
        params: { groupIds, days, preferences, budget },
        totalSpots,
      })
    )
    router.push(`/itinerary?data=${encoded}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold pixel-font text-slate-800">
          {t("plan_title") || "Plan Your Route"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("plan_subtitle") || "Pick your favorite groups and we'll design a custom Kpop pilgrimage route."}
        </p>
      </div>

      {/* Group Selector */}
      <div className="p-4 bg-white rounded-xl border border-blue-50 shadow-sm">
        <GroupSelector selected={groupIds} onChange={setGroupIds} />
      </div>

      {/* Days + Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl border border-blue-50 shadow-sm">
          <DaySelector days={days} onChange={setDays} />
        </div>
        <div className="p-4 bg-white rounded-xl border border-blue-50 shadow-sm">
          <BudgetSelector budget={budget} onChange={setBudget} />
        </div>
      </div>

      {/* Preferences */}
      <div className="p-4 bg-white rounded-xl border border-blue-50 shadow-sm">
        <PreferencePicker preferences={preferences} onChange={setPreferences} />
      </div>

      {/* Pending Spots */}
      {mounted && pendingSpotIds.length > 0 && (
        <div className="p-4 bg-white rounded-xl border border-blue-50 shadow-sm">
          <PendingSpots spotIds={pendingSpotIds} onRemove={handleRemoveSpot} />
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700 font-mono">
          {errorMsg}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={groupIds.length === 0}
        className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg, #3b82f6, #f59e0b)" }}
      >
        {t("plan_generate") || "Generate My Route"}
      </button>

      {/* Hint */}
      <p className="text-xs text-slate-400 text-center font-mono">
        {t("plan_hint") || "Instant routing by district — no API calls, no waiting."}
      </p>
    </div>
  )
}
