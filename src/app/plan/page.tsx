"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Budget, Preferences, Itinerary } from "@/types"
import GroupSelector from "@/components/planner/GroupSelector"
import DaySelector from "@/components/planner/DaySelector"
import BudgetSelector from "@/components/planner/BudgetSelector"
import PreferencePicker from "@/components/planner/PreferencePicker"
import PendingSpots from "@/components/planner/PendingSpots"
import { getPendingSpots, removePendingSpot } from "@/lib/store/pending-spots"
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
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    setMounted(true)
    setPendingSpotIds(getPendingSpots().map((s) => s.locationId))
  }, [])

  const handleRemoveSpot = (id: string) => {
    removePendingSpot(id)
    setPendingSpotIds((prev) => prev.filter((sid) => sid !== id))
  }

  const handleGenerate = async () => {
    if (groupIds.length === 0) {
      setErrorMsg("Please select at least one group.")
      setStatus("error")
      return
    }

    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupIds,
          days,
          budget,
          preferences,
          pendingSpotIds,
        }),
      })

      const json = await res.json()

      if (!json.success) {
        setErrorMsg(json.error || "Failed to generate itinerary.")
        setStatus("error")
        return
      }

      const itinerary: Itinerary = json.data.itinerary
      const encoded = encodeURIComponent(JSON.stringify(itinerary))
      router.push(`/itinerary?data=${encoded}`)
    } catch {
      setErrorMsg("Network error. Please try again.")
      setStatus("error")
    }
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
      {status === "error" && errorMsg && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700 font-mono">
          {errorMsg}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={status === "loading" || groupIds.length === 0}
        className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: status === "loading"
            ? "linear-gradient(135deg, #93c5fd, #60a5fa)"
            : "linear-gradient(135deg, #3b82f6, #f59e0b)",
        }}
      >
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t("plan_generating") || "Generating..."}
          </span>
        ) : (
          <span>{t("plan_generate") || "Generate My Route"}</span>
        )}
      </button>

      {/* Hint */}
      <p className="text-xs text-slate-400 text-center font-mono">
        {t("plan_hint") || "AI-powered route planning with 3-tier fallback · 5 generations/day"}
      </p>
    </div>
  )
}
