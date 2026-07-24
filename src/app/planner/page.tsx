"use client"

import { useState, useEffect, useCallback } from "react"
import type { LocationType } from "@/types"
import { groups } from "@/lib/data/groups"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"
import { useAuth } from "@/components/auth/AuthProvider"
import { useLang } from "@/components/LanguageProvider"
import { createClient } from "@/lib/supabase/client"

const STORAGE_KEY = "kpop_community_spots"
const TYPE_OPTIONS: LocationType[] = ["restaurant", "store", "mv_spot", "entertainment", "company"]

// Parse XHS share text: 【Title】Description... URL
function parseXhsShareText(input: string): {
  title: string | null; snippet: string | null; url: string | null; isShareText: boolean
} {
  const sharePattern = /【(.+?)】\s*(.+?)?\s*(https?:\/\/[^\s]+)/
  const match = input.match(sharePattern)
  if (match) {
    return {
      title: match[1].trim(),
      snippet: (match[2] || "").replace(/【小红书】里有答案.*$/, "").trim(),
      url: match[3],
      isShareText: true,
    }
  }
  const altPattern = /(.+?)\s+(https?:\/\/[^\s]+)/
  const altMatch = input.match(altPattern)
  if (altMatch) {
    return {
      title: altMatch[1].replace(/【小红书】里有答案.*$/, "").trim().slice(0, 80),
      snippet: null,
      url: altMatch[2],
      isShareText: true,
    }
  }
  return { title: null, snippet: null, url: null, isShareText: false }
}

function extractAddress(text: string): string | null {
  const patterns = [
    /(?:서울|부산|인천|대구|대전|광주|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s*\S*?(?:특별시|광역시|시|도)?\s+\S+[구군]\s+\S+[동읍면리]\s*(?:\S+[로길가]\s*)?\d*(?:[번\-]\d*)?(?:호|층)?/g,
    /\S{2,}[구군]\s+\S{2,}[동읍면리가로길]\s*\d*(?:[번\-]\d*)?(?:호|층)?/g,
    /首尔(?:特别市|特别自治市)?\s*\S{2,}[区洞街路]\s*\S{2,}[洞街路号]?\s*\d*(?:-\d+)?(?:号|楼|层)?/g,
    /(?:地址|위치|주소)[:：]\s*(.+?)(?:[\n，。,.]|$)/gi,
  ]
  for (const p of patterns) {
    const matches = text.matchAll(new RegExp(p.source, p.flags))
    for (const m of matches) {
      const addr = (m[1] || m[0]).trim()
      if (addr.length > 4 && addr.length < 120) return addr
    }
  }
  return null
}

export default function ContributePage() {
  const { t } = useLang()
  const { user } = useAuth()
  const [xhsInput, setXhsInput] = useState("")
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [locationName, setLocationName] = useState("")
  const [address, setAddress] = useState("")
  const [spotType, setSpotType] = useState<LocationType>("restaurant")
  const [description, setDescription] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parseMsg, setParseMsg] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  // Client-side parse of share text
  const handleParse = useCallback(() => {
    if (!xhsInput.trim()) return
    setParsing(true)
    setParseMsg("")

    const parsed = parseXhsShareText(xhsInput)
    if (parsed.isShareText) {
      const combined = [parsed.title, parsed.snippet].filter(Boolean).join(" ")
      const addr = extractAddress(combined)
      if (parsed.title && !locationName) setLocationName(parsed.title)
      if (addr && !address) setAddress(addr)
      if (parsed.snippet && !description) setDescription(parsed.snippet.slice(0, 200))
      if (parsed.url) setXhsInput(parsed.url)

      const parts = [parsed.title && "title", addr && "address"].filter(Boolean)
      setParseMsg(parts.length > 0 ? `Extracted ${parts.join(" & ")} from share text!` : "")
    } else {
      setParseMsg("No share text format detected. You can still fill manually.")
    }
    setParsing(false)
  }, [xhsInput, locationName, address, description])

  // Migrate localStorage spots to Supabase
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      const spots = JSON.parse(stored)
      if (!Array.isArray(spots) || spots.length === 0) return
      spots.forEach(async (spot: Record<string, unknown>) => {
        await supabase.from("community_spots").upsert({
          id: spot.id as string,
          location_name: spot.locationName || "",
          address: spot.address || "",
          type: spot.type || "restaurant",
          group_ids: spot.groupNames || [],
          xhs_link: spot.xhsLink || "",
          description: spot.description || "",
          submitted_by: user.id,
          status: (spot.locationName && spot.address) ? "complete" : "draft",
          created_at: spot.submittedAt || new Date().toISOString(),
        }, { onConflict: "id" })
      })
      localStorage.removeItem(STORAGE_KEY)
      console.log("Migrated", spots.length, "localStorage spots to Supabase")
    } catch {}
  }, [user])

  const handleSubmit = async () => {
    if (selectedGroups.length === 0) {
      setError("Please select at least one group.")
      return
    }
    setSaving(true)
    setError("")

    const spotId = `community_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const isComplete = !!(locationName.trim() && address.trim())

    if (user) {
      const supabase = createClient()
      const { error: insertErr } = await supabase.from("community_spots").insert({
        id: spotId,
        location_name: locationName.trim(),
        address: address.trim(),
        type: spotType,
        group_ids: selectedGroups,
        xhs_link: xhsInput.trim(),
        description: description.trim(),
        submitted_by: user.id,
        status: isComplete ? "complete" : "draft",
      })
      if (insertErr) {
        setError(insertErr.message)
        setSaving(false)
        return
      }
    } else {
      // Fallback to localStorage
      const spot = {
        id: spotId,
        locationName: locationName.trim(),
        address: address.trim(),
        type: spotType,
        groupNames: selectedGroups,
        xhsLink: xhsInput.trim(),
        description: description.trim(),
        submittedAt: new Date().toISOString(),
      }
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
        stored.unshift(spot)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(0, 100)))
      } catch {}
    }

    setSaving(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="text-xl font-bold pixel-font text-slate-800 mb-2">SPOT ADDED!</h1>
        <p className="text-sm text-slate-500 font-mono mb-2">
          Thanks for contributing!
        </p>
        {(!locationName.trim() || !address.trim()) && (
          <p className="text-xs text-amber-500 font-mono mb-4 bg-amber-50 p-2 border border-amber-200 inline-block">
            This spot needs more info — other fans can help complete it.
          </p>
        )}
        <button
          onClick={() => {
            setSubmitted(false)
            setXhsInput("")
            setSelectedGroups([])
            setLocationName("")
            setAddress("")
            setDescription("")
            setParseMsg("")
            setError("")
          }}
          className="pixel-btn px-6 py-2 bg-blue-500 text-white"
        >
          ADD ANOTHER SPOT
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <p className="text-3xl mb-2">📌</p>
        <h1 className="text-2xl font-bold pixel-font text-slate-800">{t("add_spot_title")}</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          {t("add_spot_subtitle")}
        </p>
      </div>

      {/* Select Groups — REQUIRED */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          💜 {t("add_spot_select_group")} * (required)
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 border-2 border-slate-300 bg-white">
          {groups
            .sort((a, b) => b.popularity - a.popularity)
            .map((g) => (
              <button
                key={g.id}
                onClick={() => toggleGroup(g.id)}
                className={`pixel-btn px-2.5 py-1 text-[10px] transition ${
                  selectedGroups.includes(g.id) ? "text-white border-slate-800" : "bg-white text-slate-500"
                }`}
                style={selectedGroups.includes(g.id) ? { backgroundColor: g.color, borderColor: "#1e293b" } : {}}
              >
                {g.name}
              </button>
            ))}
        </div>
        {selectedGroups.length > 0 && (
          <p className="text-xs font-mono text-slate-400">
            {selectedGroups.map((id) => groups.find((g) => g.id === id)?.name).join(", ")}
          </p>
        )}
      </div>

      {/* XHS Link — optional, with parse */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          📱 {t("add_spot_share")} (optional)
        </label>
        <div className="flex gap-2">
          <textarea
            placeholder={t("add_spot_xhs_hint")}
            value={xhsInput}
            onChange={(e) => setXhsInput(e.target.value)}
            rows={2}
            className="flex-1 px-3 py-2 text-sm font-mono border-2 border-slate-300 focus:border-blue-400 outline-none bg-white resize-none"
          />
          <button
            onClick={handleParse}
            disabled={!xhsInput.trim() || parsing}
            className="pixel-btn px-3 py-2 text-xs bg-amber-50 text-amber-700 whitespace-nowrap disabled:opacity-40 self-start"
          >
            {parsing ? "..." : "PARSE"}
          </button>
        </div>
        {parseMsg && (
          <p className={`text-xs font-mono ${parseMsg.includes("Extracted") ? "text-green-600" : "text-amber-600"}`}>
            {parseMsg}
          </p>
        )}
      </div>

      {/* Location Name — optional */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          📍 {t("add_spot_name")}
        </label>
        <input
          type="text"
          placeholder="e.g. 金希澈严选一人食火锅"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
        />
      </div>

      {/* Address — optional */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          🗺 {t("add_spot_address")}
        </label>
        <input
          type="text"
          placeholder="e.g. 首尔特别市麻浦区西桥洞"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">🏷 {t("add_spot_type")}</label>
        <div className="flex gap-1.5">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setSpotType(t)}
              className={`pixel-btn px-3 py-1.5 text-[10px] ${
                spotType === t ? "text-white" : "bg-white text-slate-500"
              }`}
              style={spotType === t ? { backgroundColor: LOCATION_TYPES[t].color, borderColor: "#1e293b" } : {}}
            >
              {TYPE_NAME_CN[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Description — optional */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          📝 {t("add_spot_description")}
        </label>
        <textarea
          placeholder="Any tips for other fans?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono resize-none"
        />
      </div>

      {error && <p className="text-xs font-mono text-red-500 bg-red-50 p-2 border border-red-200">{error}</p>}
      {!user && (
        <p className="text-xs font-mono text-amber-500 bg-amber-50 p-2 border border-amber-200">
          {t("add_spot_draft_notice")}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving || selectedGroups.length === 0}
        className="w-full py-3 btn-cute text-white font-bold rounded-xl disabled:opacity-40 text-sm"
      >
        {saving ? t("common_loading") : "✨ " + t("add_spot_submit")}
      </button>

      <p className="text-[10px] font-mono text-slate-300 text-center">
        Only group selection is required. Other fans can help fill in the details!
      </p>
    </div>
  )
}
