"use client"

import { useState, useEffect } from "react"
import type { LocationType } from "@/types"
import { groups } from "@/lib/data/groups"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"

interface CommunitySpot {
  id: string
  locationName: string
  address: string
  type: LocationType
  groupNames: string[]
  xhsLink: string
  description: string
  submittedAt: string
}

const STORAGE_KEY = "kpop_community_spots"
const TYPE_OPTIONS: LocationType[] = ["restaurant", "store", "mv_spot", "entertainment", "company"]

export default function ContributePage() {
  const [xhsLink, setXhsLink] = useState("")
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [locationName, setLocationName] = useState("")
  const [address, setAddress] = useState("")
  const [spotType, setSpotType] = useState<LocationType>("restaurant")
  const [description, setDescription] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState("")

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  const handleFetchXHS = async () => {
    if (!xhsLink.trim()) return
    setFetching(true)
    setFetchError("")

    try {
      // Try to fetch note info via a CORS proxy
      // Most XHS links won't work due to auth walls, so we extract what we can
      const url = xhsLink.trim()

      // Try to fetch the page title/metadata
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(8000),
      }).catch(() => null)

      if (res && res.ok) {
        const html = await res.text()
        // Extract title
        const titleMatch = html.match(/<title>([^<]+)<\/title>/)
        if (titleMatch) {
          const title = titleMatch[1].replace(/ - 小红书$/, "").trim()
          if (!locationName) setLocationName(title)
        }
        // Extract description meta
        const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/)
        if (descMatch && !description) {
          setDescription(descMatch[1].slice(0, 200))
        }
        setFetchError("Note info extracted! Please fill in the location details below.")
      } else {
        // Can't fetch - that's OK, user can still manually fill
        setFetchError("Can't auto-fetch (XHS requires login). Please paste the link for reference and fill details manually.")
      }
    } catch {
      setFetchError("Can't auto-fetch. Please fill in the details manually below.")
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = () => {
    if (!locationName.trim() || !address.trim() || selectedGroups.length === 0) return

    const spot: CommunitySpot = {
      id: `community_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      locationName: locationName.trim(),
      address: address.trim(),
      type: spotType,
      groupNames: selectedGroups,
      xhsLink: xhsLink.trim(),
      description: description.trim(),
      submittedAt: new Date().toISOString(),
    }

    try {
      const stored: CommunitySpot[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      stored.unshift(spot)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(0, 100)))
      setSubmitted(true)
    } catch {}
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="text-xl font-bold pixel-font text-slate-800 mb-2">SPOT ADDED!</h1>
        <p className="text-sm text-slate-500 font-mono mb-4">
          Your spot &quot;{locationName}&quot; has been added.
          <br />
          It will appear on the group pages.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setXhsLink("")
            setSelectedGroups([])
            setLocationName("")
            setAddress("")
            setDescription("")
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
        <h1 className="text-2xl font-bold pixel-font text-slate-800">ADD A SPOT</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Share your idol&apos;s favorite places with the community!
        </p>
      </div>

      {/* Xiaohongshu Link */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          📱 Xiaohongshu Link (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://www.xiaohongshu.com/explore/..."
            value={xhsLink}
            onChange={(e) => setXhsLink(e.target.value)}
            className="flex-1 px-3 py-2 text-sm font-mono border-2 border-slate-300 focus:border-blue-400 outline-none bg-white"
          />
          <button
            onClick={handleFetchXHS}
            disabled={!xhsLink.trim() || fetching}
            className="pixel-btn px-3 py-2 text-xs bg-amber-50 text-amber-700 whitespace-nowrap"
          >
            {fetching ? "..." : "FETCH"}
          </button>
        </div>
        {fetchError && (
          <p className="text-xs font-mono text-amber-600">{fetchError}</p>
        )}
      </div>

      {/* Select Groups */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          💜 Which idol / group? (multi-select)
        </label>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 border-2 border-slate-200 bg-white">
          {groups
            .sort((a, b) => b.popularity - a.popularity)
            .map((g) => (
              <button
                key={g.id}
                onClick={() => toggleGroup(g.id)}
                className={`pixel-btn px-2.5 py-1 text-[10px] transition ${
                  selectedGroups.includes(g.id)
                    ? "text-white border-slate-800"
                    : "bg-white text-slate-500"
                }`}
                style={
                  selectedGroups.includes(g.id)
                    ? { backgroundColor: g.color, borderColor: "#1e293b" }
                    : {}
                }
              >
                {g.name}
              </button>
            ))}
        </div>
        {selectedGroups.length > 0 && (
          <p className="text-xs font-mono text-slate-400">
            Selected: {selectedGroups.map((id) => groups.find((g) => g.id === id)?.name).join(", ")}
          </p>
        )}
      </div>

      {/* Location Name */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          📍 Location Name *
        </label>
        <input
          type="text"
          placeholder="e.g. 金钟国HAHA的401烤肉店"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          🗺 Address *
        </label>
        <input
          type="text"
          placeholder="e.g. 首尔特别市麻浦区西桥洞XX号"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          🏷 Type
        </label>
        <div className="flex gap-1.5">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setSpotType(t)}
              className={`pixel-btn px-3 py-1.5 text-[10px] ${
                spotType === t
                  ? "text-white"
                  : "bg-white text-slate-500"
              }`}
              style={
                spotType === t
                  ? { backgroundColor: LOCATION_TYPES[t].color, borderColor: "#1e293b" }
                  : {}
              }
            >
              {TYPE_NAME_CN[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          📝 Notes (optional)
        </label>
        <textarea
          placeholder="Any tips for other fans? What's special about this place?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!locationName.trim() || !address.trim() || selectedGroups.length === 0}
        className="w-full py-3 btn-cute text-white font-bold rounded-xl disabled:opacity-40 text-sm"
      >
        ✨ SUBMIT SPOT
      </button>

      <p className="text-[10px] font-mono text-slate-300 text-center">
        Your contribution will be saved locally and visible to other fans.
        <br />
        Thanks for sharing! 💜
      </p>
    </div>
  )
}
