"use client"

import { useState } from "react"
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

// Regex patterns for extracting addresses and store names from pasted text
const ADDRESS_EXTRACT_PATTERNS = [
  // Korean: 서울특별시/서울시 XX구 XX동 XX로 XX길 + street number
  /(?:서울|부산|인천|대구|대전|광주|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)(?:\s*(?:특별시|광역시|특별자치시|특별자치도|시|도|군|구))?\s*\S*?(?:구|군|시)\s+\S+(?:동|읍|면|가|로|길)\s*(?:\d+(?:[번\-]\d*)?(?:\s*(?:번지|호|층))?)?/g,
  // Chinese: 首尔XX区XX洞XX号
  /首尔(?:特别市|特别自治市)?\s*\S*?(?:区|洞|街|路)\s*\S*(?:洞|街|路|号)?\s*\d*(?:-\d+)?(?:号|楼|层)?/g,
  // Address keyword pattern: "地址：XXX" or "地址: XXX"
  /(?:地址|위치|주소|서울|首尔)[:：]\s*(.+?)(?:[\n，。,.]|$)/gi,
  // Korean address with dong/ro/gil
  /(?:서울|Seoul)[\s\w]*(?:구|gu|동|dong|로|ro|길|gil)[\s\w]*\d*(?:-\d+)?/gi,
  // General: XX区XX洞 / XX구XX동
  /\S{2,}(?:구|区)\s+\S{2,}(?:동|洞)\s*\d*(?:-\d+)?(?:번지|호)?/g,
]

const STORE_NAME_PATTERNS = [
  /(?:店名|店铺|点名|店鋪|餐厅|饭店|咖啡厅|咖啡店|小店|烤肉店)[:：]\s*(.+?)(?:[\n，。,.]|$)/,
  /(?:📍|🏪|🏬|🏢|🍽️|☕|🍜|🍰|🥩|🍗)\s*(.+?)(?:[\n，。,.]|$)/,
  /(.+?)\s*(?:地址|위치|주소)[:：]/,
  /(?:探店|打卡|推荐|방문|맛집)\s*[|｜]\s*(.+?)(?:[\n，。,.]|$)/,
  /[「"]([^「"」"]{2,40})[」"]/,
  // XHS note title often has store name first
  /^(.{2,40}?)(?:探店|打卡|攻略|测评|同款|推荐|地址|📍)/,
]

function extractFromPastedText(text: string): { name: string | null; address: string | null } {
  let name: string | null = null
  let address: string | null = null

  // Try store name extraction
  for (const pattern of STORE_NAME_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[1]?.trim().length > 1) {
      name = match[1].trim().slice(0, 60)
      break
    }
  }

  // Try address extraction - iterate through all patterns
  for (const pattern of ADDRESS_EXTRACT_PATTERNS) {
    const matches = text.matchAll(new RegExp(pattern.source, pattern.flags))
    for (const match of matches) {
      const addr = (match[1] || match[0])?.trim()
      if (addr && addr.length > 4 && addr.length < 150) {
        address = addr
        break
      }
    }
    if (address) break
  }

  // If no store name found from patterns, try line-by-line heuristic:
  // First non-empty short line is often the store name in XHS posts
  if (!name) {
    const lines = text.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean)
    for (const line of lines) {
      // Skip lines that look like addresses, dates, tags
      if (
        line.length > 3 &&
        line.length < 50 &&
        !/^(?:#|地址|위치|주소|位置|时间|营业|电话|价格|路线|交通|停车)/.test(line) &&
        !/\d{1,2}[:：]\d{2}/.test(line)
      ) {
        name = line
        break
      }
    }
  }

  return { name, address }
}

// Try multiple CORS proxies in parallel
async function tryProxies(url: string): Promise<{ name: string | null; address: string | null; desc: string | null }> {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ]

  const results = await Promise.allSettled(
    proxies.map(async (proxyUrl) => {
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) })
      if (!res.ok) throw new Error("proxy failed")
      return res.text()
    })
  )

  for (const result of results) {
    if (result.status !== "fulfilled") continue
    const html = result.value

    const titleMatch = html.match(/<title>([^<]+)<\/title>/)
    const title = titleMatch
      ? titleMatch[1].replace(/\s*[-–—|｜]\s*(?:小红书|RedNote|Xiaohongshu).*$/i, "").trim()
      : null

    const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/)
    const desc = descMatch?.[1]?.slice(0, 200) || null

    const ogDescMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/)
    const ogDesc = ogDescMatch?.[1]?.slice(0, 200) || null

    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim()

    const { name, address } = extractFromPastedText(textContent)

    if (name || title) {
      return { name: name || title, address, desc: desc || ogDesc }
    }
  }

  return { name: null, address: null, desc: null }
}

export default function ContributePage() {
  const [xhsLink, setXhsLink] = useState("")
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [locationName, setLocationName] = useState("")
  const [address, setAddress] = useState("")
  const [spotType, setSpotType] = useState<LocationType>("restaurant")
  const [description, setDescription] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetchStatus, setFetchStatus] = useState("")
  const [showPasteArea, setShowPasteArea] = useState(false)
  const [pastedText, setPastedText] = useState("")

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  // Fill form fields from extracted data
  const fillFromExtracted = (name: string | null, addr: string | null, desc: string | null) => {
    if (name && !locationName) setLocationName(name)
    if (addr && !address) setAddress(addr)
    if (desc && !description) setDescription(desc)
  }

  const handleFetchXHS = async () => {
    if (!xhsLink.trim()) return
    setFetching(true)
    setFetchStatus("Trying server API...")

    const url = xhsLink.trim()

    // Step 1: Try server-side API first
    try {
      const res = await fetch("/api/parse-xhs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(10000),
      })

      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          const { title, address: addr, description: desc } = json.data
          if (title || addr) {
            fillFromExtracted(title, addr, desc)
            setFetchStatus("📝 Info extracted! Review and fill remaining fields below.")
            setFetching(false)
            return
          }
        }
      }
    } catch {
      // Server API failed, try proxies
    }

    // Step 2: Try CORS proxies
    setFetchStatus("Trying proxy services...")
    try {
      const { name, address: addr, desc } = await tryProxies(url)
      if (name || addr) {
        fillFromExtracted(name, addr, desc)
        setFetchStatus("📝 Partial info extracted. Please verify and fill remaining fields.")
      } else {
        setFetchStatus("Can't auto-extract from this link (XHS requires login). You can paste the note content below for auto-fill, or fill in manually.")
        setShowPasteArea(true)
      }
    } catch {
      setFetchStatus("Can't auto-extract. Paste the note content below for smart fill, or enter details manually.")
      setShowPasteArea(true)
    } finally {
      setFetching(false)
    }
  }

  const handlePasteText = () => {
    if (!pastedText.trim()) return
    const { name, address: addr } = extractFromPastedText(pastedText)

    if (name || addr) {
      fillFromExtracted(name, addr, null)
      setFetchStatus(
        [name && "name", addr && "address"].filter(Boolean).length > 0
          ? `Extracted: ${[name && "name", addr && "address"].filter(Boolean).join(" & ")}. Please verify!`
          : ""
      )
    } else {
      setFetchStatus("Couldn't find address or name patterns. Please type them in manually.")
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
            setFetchStatus("")
            setShowPasteArea(false)
            setPastedText("")
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
            className="pixel-btn px-3 py-2 text-xs bg-amber-50 text-amber-700 whitespace-nowrap disabled:opacity-40"
          >
            {fetching ? "..." : "FETCH"}
          </button>
        </div>
        {fetchStatus && (
          <p className={`text-xs font-mono ${fetchStatus.startsWith("📝") || fetchStatus.startsWith("Extracted") ? "text-green-600" : "text-amber-600"}`}>
            {fetchStatus}
          </p>
        )}
      </div>

      {/* Paste note content (shown when auto-fetch fails or user expands) */}
      {showPasteArea && (
        <div className="space-y-2 p-3 border-2 border-dashed border-amber-300 bg-amber-50/50">
          <label className="text-sm font-bold pixel-font text-slate-700 flex items-center gap-1">
            📋 Paste XHS Note Content
            <span className="text-[10px] font-normal text-amber-500">(for auto-extraction)</span>
          </label>
          <textarea
            placeholder="Paste the text content of the Xiaohongshu note here...&#10;We'll try to extract the store name and address automatically."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-xs border-2 border-slate-300 focus:border-amber-400 outline-none bg-white font-mono resize-none"
          />
          <button
            onClick={handlePasteText}
            disabled={!pastedText.trim()}
            className="pixel-btn px-4 py-1.5 text-[10px] bg-amber-100 text-amber-700 disabled:opacity-30"
          >
            🔍 EXTRACT INFO
          </button>
        </div>
      )}

      {!showPasteArea && fetchStatus && fetchStatus.includes("paste the note content") && (
        <button
          onClick={() => setShowPasteArea(true)}
          className="w-full py-2 pixel-border-dashed text-xs font-mono text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition"
        >
          📋 Paste note content for auto-extraction instead →
        </button>
      )}

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
