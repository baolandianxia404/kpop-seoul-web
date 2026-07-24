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

// XHS share text format: 【Title】Description... URL
const XHS_SHARE_PATTERN = /【(.+?)】\s*(.+?)?\s*(https?:\/\/[^\s]+)/
const XHS_ALT_PATTERN = /(.+?)\s+(https?:\/\/[^\s]+)/
const XHS_URL_PATTERN = /xhslink\.com|xiaohongshu\.com|xhslink\.cn/

function parseXhsShareText(input: string) {
  const shareMatch = input.match(XHS_SHARE_PATTERN)
  if (shareMatch) {
    return {
      title: shareMatch[1].trim(),
      snippet: (shareMatch[2] || "").replace(/【小红书】里有答案.*$/, "").trim(),
      url: shareMatch[3],
      isShareText: true,
    }
  }
  const altMatch = input.match(XHS_ALT_PATTERN)
  if (altMatch && XHS_URL_PATTERN.test(altMatch[2])) {
    return {
      title: altMatch[1].replace(/【小红书】里有答案.*$/, "").trim().slice(0, 80),
      snippet: null,
      url: altMatch[2],
      isShareText: true,
    }
  }
  // It's a plain URL or unrecognized text
  const urlMatch = input.match(/(https?:\/\/[^\s]+)/)
  return {
    title: null,
    snippet: null,
    url: urlMatch?.[1] || null,
    isShareText: false,
  }
}

function extractAddress(text: string): string | null {
  const patterns = [
    // Full Korean address: 서울/경기 etc + 구/군 + 동/읍/면/리 + 로/길 + numbers
    /(?:서울|부산|인천|대구|대전|광주|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s*\S*?(?:특별시|광역시|시|도)?\s+\S+[구군]\s+\S+[동읍면리]\s*(?:\S+[로길가]\s*)?\d*(?:[번\-]\d*)?(?:호|층)?/g,
    // Shorter: XX구 XX동
    /\S{2,}[구군]\s+\S{2,}[동읍면리가로길]\s*\d*(?:[번\-]\d*)?(?:호|층)?/g,
    // Chinese-style Korean address
    /首尔(?:特别市|特别自治市)?\s*\S{2,}[区洞街路]\s*\S{2,}[洞街路号]?\s*\d*(?:-\d+)?(?:号|楼|层)?/g,
    // Labeled: 地址/위치/주소: ...
    /(?:地址|위치|주소|위치정보|장소)[:：]\s*(.+?)(?:[\n，。,.]|$)/gi,
    // Map-style: XX洞 XX号 or XX로 XX길
    /\S+[동로길가]\s+\d+(?:[번\-]\d+)?(?:호|층)?/g,
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
  const [showHowto, setShowHowto] = useState(false)

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  const handleParse = useCallback(async () => {
    if (!xhsInput.trim()) return
    setParsing(true)
    setParseMsg("")

    const parsed = parseXhsShareText(xhsInput)

    if (parsed.isShareText) {
      // Share text has rich 【Title】+ description → extract locally
      const combined = [parsed.title, parsed.snippet].filter(Boolean).join(" ")
      const addr = extractAddress(combined)
      if (parsed.title && !locationName) setLocationName(parsed.title)
      if (addr && !address) setAddress(addr)
      if (parsed.snippet && !description) setDescription(parsed.snippet.slice(0, 200))

      if (addr) {
        setParseMsg(t("add_spot_parse_title"))
      } else {
        setParseMsg(t("add_spot_parse_title_only"))
      }
    } else if (parsed.url) {
      // Just a URL — try server-side fetch via Cloudflare Function
      setParseMsg(t("add_spot_fetching_url"))
      try {
        const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(parsed.url)}`)
        if (res.ok) {
          const meta = await res.json()
          if (meta.title && !locationName) setLocationName(meta.title)
          if (meta.description && !description) setDescription(meta.description.slice(0, 200))
          if (meta.possibleAddress && !address) setAddress(meta.possibleAddress)

          const extracted = [meta.title && "title", meta.possibleAddress && "address"].filter(Boolean)
          if (extracted.length > 0) {
            setParseMsg(`Extracted ${extracted.join(" & ")} from URL.`)
          } else {
            setParseMsg(t("add_spot_fetch_url_failed"))
          }
        } else {
          setParseMsg(t("add_spot_fetch_url_failed"))
        }
      } catch {
        setParseMsg(t("add_spot_fetch_url_failed"))
      }
    } else {
      // No URL detected at all — try extracting address from plain text
      const addr = extractAddress(xhsInput)
      if (addr && !address) setAddress(addr)
      setParseMsg(
        addr
          ? t("add_spot_parse_title")
          : t("add_spot_xhs_url_only")
      )
    }
    setParsing(false)
  }, [xhsInput, locationName, address, description, t])

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
    } catch {}
  }, [user])

  const handleSubmit = async () => {
    if (selectedGroups.length === 0) {
      setError(t("add_spot_needs_group"))
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
        <h1 className="text-xl font-bold pixel-font text-slate-800 mb-2">{t("add_spot_success_title")}</h1>
        <p className="text-sm text-slate-500 font-mono mb-2">{t("add_spot_success_msg")}</p>
        {(!locationName.trim() || !address.trim()) && (
          <p className="text-xs text-amber-500 font-mono mb-4 bg-amber-50 p-2 border border-amber-200 inline-block">
            {t("add_spot_success_draft")}
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
          {t("add_spot_success_another")}
        </button>
      </div>
    )
  }

  const isUrlOnly = XHS_URL_PATTERN.test(xhsInput) && !XHS_SHARE_PATTERN.test(xhsInput) && xhsInput.trim().match(/^https?:\/\/[^\s]+$/)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <p className="text-3xl mb-2">📌</p>
        <h1 className="text-2xl font-bold pixel-font text-slate-800">{t("add_spot_title")}</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">{t("add_spot_subtitle")}</p>
      </div>

      {/* Select Groups — REQUIRED */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          💜 {t("add_spot_select_group")} *
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

      {/* XHS Share Text — the core feature */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold pixel-font text-slate-700">
            📱 {t("add_spot_share")}
          </label>
          <button
            onClick={() => setShowHowto(!showHowto)}
            className="text-[10px] font-mono text-blue-400 hover:text-blue-500 underline"
          >
            {showHowto ? "Hide guide ↑" : "How to?"}
          </button>
        </div>

        {/* How-to guide */}
        {showHowto && (
          <div className="bg-blue-50 border border-blue-200 p-3 space-y-1.5 text-xs font-mono">
            <p className="font-bold text-blue-700 mb-1">{t("add_spot_howto_title")}</p>
            <p className="text-slate-600">1. {t("add_spot_howto_step1")}</p>
            <p className="text-slate-600">2. {t("add_spot_howto_step2")}</p>
            <p className="text-slate-600">3. {t("add_spot_howto_step3")}</p>
            <p className="text-[10px] text-slate-400 pt-1 border-t border-blue-100 mt-1">
              {t("add_spot_xhs_example")}
            </p>
          </div>
        )}

        <textarea
          value={xhsInput}
          onChange={(e) => { setXhsInput(e.target.value); setParseMsg("") }}
          placeholder={t("add_spot_xhs_hint")}
          rows={3}
          className="w-full px-3 py-2 text-sm font-mono border-2 border-slate-300 focus:border-blue-400 outline-none bg-white resize-none"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleParse}
            disabled={!xhsInput.trim() || parsing}
            className="pixel-btn px-4 py-1.5 text-xs bg-amber-50 text-amber-700 whitespace-nowrap disabled:opacity-40 hover:bg-amber-100 transition"
          >
            {parsing ? "⏳ ..." : "🔍 " + t("add_spot_parse_btn")}
          </button>

          {isUrlOnly && (
            <p className="text-[10px] text-amber-500 font-mono leading-tight">
              ⚠️ {t("add_spot_xhs_url_only")}
            </p>
          )}
        </div>

        {parseMsg && (
          <p
            className={`text-xs font-mono px-2 py-1 ${
              parseMsg.includes("Extracted") || parseMsg.includes("已从")
                ? "bg-green-50 text-green-600 border border-green-200"
                : parseMsg.includes("Fetching") || parseMsg.includes("正在从")
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "bg-amber-50 text-amber-600 border border-amber-200"
            }`}
          >
            {parseMsg}
          </p>
        )}

        {/* Format hint */}
        <p className="text-[10px] text-slate-300 font-mono">
          {t("add_spot_xhs_example")}
        </p>
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
          placeholder="e.g. 서울 마포구 서교동 123-4"
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
          placeholder="Any tips or notes for other fans..."
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
        {t("add_spot_footer")}
      </p>
    </div>
  )
}
