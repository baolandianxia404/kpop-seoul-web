"use client"

import { useState, useCallback } from "react"
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

// Parse XHS share text: 【Title】Description... URL 【小红书】里有答案
function parseXhsShareText(input: string): {
  title: string | null
  snippet: string | null
  url: string | null
  isShareText: boolean
} {
  // Pattern 1: 【Title】Description... URL
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
  // Pattern 2: Plain text + URL
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

// Extract address from text
function extractAddressFromText(text: string): string | null {
  const patterns = [
    /(?:서울|부산|인천|대구|대전|광주|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s*\S*?(?:특별시|광역시|시|도)?\s+\S+[구군]\s+\S+[동읍면리]\s*(?:\S+[로길가]\s*)?\d*(?:[번\-]\d*)?(?:호|층)?/g,
    /\S{2,}[구군]\s+\S{2,}[동읍면리가로길]\s*\d*(?:[번\-]\d*)?(?:호|층)?/g,
    /首尔(?:特别市|特别自治市)?\s*\S{2,}[区洞街路]\s*\S{2,}[洞街路号]?\s*\d*(?:-\d+)?(?:号|楼|层)?/g,
    /(?:地址|위치|주소)[:：]\s*(.+?)(?:[\n，。,.]|$)/gi,
    /\S+(?:동|로|길|가)\s*\d+(?:[번\-]\d*)?(?:호|층)?/g,
  ]
  for (const pattern of patterns) {
    const matches = text.matchAll(new RegExp(pattern.source, pattern.flags))
    for (const m of matches) {
      const addr = (m[1] || m[0]).trim()
      if (addr.length > 4 && addr.length < 120) return addr
    }
  }
  return null
}

// Extract restaurant/store name from text
function extractStoreNameFromText(text: string): string | null {
  const patterns = [
    /(?:店名|店铺|点名|店鋪|餐厅|饭店|咖啡厅|咖啡店|小店|烤肉店|食堂|美食)[:：]\s*(.+?)(?:[\n，。,.]|$)/,
    /(?:📍|🏪|🏬|🏢|🍽️|☕|🍜|🍰|🥩|🍗|🍲|🥘)\s*(.+?)(?:[\n，。,.]|$)/,
    /(.+?)\s*(?:地址|위치|주소)[:：]/,
    /(?:探店|打卡|推荐|방문|맛집|同款|严选)\s*[|｜]\s*(.+?)(?:[\n，。,.]|$)/,
    /[「"]([^「"」"]{2,40})[」"]/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    const name = match?.[1]?.trim()
    if (name && name.length > 1) return name.slice(0, 60)
  }
  // Fallback: first short line
  const lines = text.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (line.length > 3 && line.length < 50 &&
      !/^(?:#|地址|위치|주소|位置|时间|营业|电话|价格|路线|交通|停车|韩文|中文)/.test(line) &&
      !/\d{1,2}[:：]\d{2}/.test(line)) {
      return line
    }
  }
  return null
}

export default function ContributePage() {
  const [xhsInput, setXhsInput] = useState("")
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

  const fillFields = useCallback(
    (title: string | null, addr: string | null, desc: string | null, link: string | null) => {
      if (title && !locationName) setLocationName(title)
      if (addr && !address) setAddress(addr)
      if (desc && !description) setDescription(desc)
      if (link && !xhsInput.includes(link)) setXhsInput(link)
    },
    [locationName, address, description, xhsInput]
  )

  // Step 1: Client-side parse of XHS share text (instant, no network)
  const clientParse = useCallback(() => {
    if (!xhsInput.trim()) return null
    const parsed = parseXhsShareText(xhsInput)

    if (parsed.isShareText) {
      const combinedText = [parsed.title, parsed.snippet].filter(Boolean).join(" ")
      const addr = extractAddressFromText(combinedText)
      const name = parsed.title || extractStoreNameFromText(combinedText)

      if (name || addr) {
        fillFields(name, addr, parsed.snippet?.slice(0, 200) || null, parsed.url)
        return { name, addr, url: parsed.url }
      }
    }
    return null
  }, [xhsInput, fillFields])

  const handleFetchXHS = async () => {
    if (!xhsInput.trim()) return
    setFetching(true)
    setFetchStatus("Parsing...")

    // Step 1: Client-side instant parse of share text format
    const clientResult = clientParse()
    if (clientResult?.name || clientResult?.addr) {
      const parts = [clientResult.name && "title", clientResult.addr && "address"].filter(Boolean)
      setFetchStatus(parts.length > 0 ? `Extracted ${parts.join(" & ")} from share text! Review below.` : "")
      setFetching(false)
      return
    }

    // Step 2: Try server API
    setFetchStatus("Trying server...")
    try {
      const res = await fetch("/api/parse-xhs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: xhsInput }),
        signal: AbortSignal.timeout(10000),
      })

      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          const { title, address: addr, description: desc, url: link, isShareText } = json.data
          if (title || addr) {
            fillFields(title, addr, desc, link)
            if (isShareText) {
              setFetchStatus("Parsed share text! Please verify the extracted info below.")
            } else {
              setFetchStatus("Info extracted! Review and fill remaining fields.")
            }
            setFetching(false)
            return
          }
        }
      }
    } catch { /* fall through */ }

    // Step 3: Nothing worked - show paste area
    setFetchStatus("Can't extract from this link. You can paste the note text content below, or fill in manually.")
    setShowPasteArea(true)
    setFetching(false)
  }

  const handlePasteText = () => {
    if (!pastedText.trim()) return
    const combined = pastedText
    const name = extractStoreNameFromText(combined)
    const addr = extractAddressFromText(combined)

    if (name || addr) {
      fillFields(name, addr, null, null)
      const parts = [name && "name", addr && "address"].filter(Boolean)
      setFetchStatus(`Extracted ${parts.join(" & ")}! Please verify.`)
    } else {
      setFetchStatus("Couldn't find address/name patterns. Please type them in manually.")
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
      xhsLink: xhsInput.trim(),
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
            setXhsInput("")
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

      {/* Xiaohongshu Link / Share Text */}
      <div className="space-y-2">
        <label className="text-sm font-bold pixel-font text-slate-700">
          📱 Xiaohongshu Link or Share Text
        </label>
        <p className="text-[10px] font-mono text-slate-400">
          Paste the full share message from XHS app (with title text) for best results.
        </p>
        <div className="flex gap-2">
          <textarea
            placeholder="Paste XHS share text or link here...&#10;e.g. 【SJ同款食堂】金希澈严选❗️一人食火锅😋 https://xhslink.cn/..."
            value={xhsInput}
            onChange={(e) => setXhsInput(e.target.value)}
            rows={2}
            className="flex-1 px-3 py-2 text-sm font-mono border-2 border-slate-300 focus:border-blue-400 outline-none bg-white resize-none"
          />
          <button
            onClick={handleFetchXHS}
            disabled={!xhsInput.trim() || fetching}
            className="pixel-btn px-4 py-2 text-xs bg-amber-50 text-amber-700 whitespace-nowrap disabled:opacity-40 self-start"
          >
            {fetching ? "..." : "PARSE"}
          </button>
        </div>
        {fetchStatus && (
          <p
            className={`text-xs font-mono ${
              fetchStatus.startsWith("Extracted") || fetchStatus.startsWith("Parsed") || fetchStatus.startsWith("Info")
                ? "text-green-600"
                : "text-amber-600"
            }`}
          >
            {fetchStatus}
          </p>
        )}
      </div>

      {/* Paste note content (fallback) */}
      {showPasteArea && (
        <div className="space-y-2 p-3 border-2 border-dashed border-amber-300 bg-amber-50/50">
          <label className="text-sm font-bold pixel-font text-slate-700 flex items-center gap-1">
            📋 Paste XHS Note Text for Auto-Extraction
          </label>
          <textarea
            placeholder="Open the XHS note, copy the text content, and paste here..."
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
            EXTRACT INFO
          </button>
        </div>
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
          placeholder="e.g. 金希澈严选一人食火锅"
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
                spotType === t ? "text-white" : "bg-white text-slate-500"
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
