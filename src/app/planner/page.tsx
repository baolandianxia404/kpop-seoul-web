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

// Seoul districts for quick-select
const SEOUL_DISTRICTS = [
  "마포구", "강남구", "용산구", "성동구", "중구", "종로구",
  "영등포구", "광진구", "서대문구", "동대문구", "송파구", "서초구",
  "강서구", "금천구", "구로구", "관악구", "동작구", "은평구",
  "강북구", "도봉구", "노원구", "중랑구", "강동구", "양천구", "성북구",
]

// XHS share text format: 【Title】Description... URL
const XHS_SHARE_PATTERN = /【(.+?)】\s*(.+?)?\s*(https?:\/\/[^\s]+)/
const XHS_ALT_PATTERN = /(.+?)\s+(https?:\/\/[^\s]+)/
const XHS_URL_PATTERN = /xhslink\.com|xiaohongshu\.com|xhslink\.cn/

// Map Chinese district names → Korean
const CN_TO_KR_DISTRICT: Record<string, string> = {
  "麻浦区": "마포구", "麻浦": "마포구", "마포구": "마포구", "마포": "마포구",
  "江南区": "강남구", "江南": "강남구", "강남구": "강남구", "강남": "강남구",
  "龙山区": "용산구", "龙山": "용산구", "용산구": "용산구", "용산": "용산구",
  "城东区": "성동구", "城东": "성동구", "성동구": "성동구", "성동": "성동구",
  "中区": "중구", "중구": "중구",
  "钟路区": "종로구", "钟路": "종로구", "종로구": "종로구", "종로": "종로구",
  "永登浦区": "영등포구", "永登浦": "영등포구", "영등포구": "영등포구", "영등포": "영등포구",
  "广津区": "광진구", "广津": "광진구", "광진구": "광진구", "광진": "광진구",
  "西大门区": "서대문구", "西大门": "서대문구", "서대문구": "서대문구",
  "东大门区": "동대문구", "东大门": "동대문구", "동대문구": "동대문구",
  "松坡区": "송파구", "松坡": "송파구", "송파구": "송파구",
  "瑞草区": "서초구", "瑞草": "서초구", "서초구": "서초구",
  "江西区": "강서구", "江西": "강서구", "강서구": "강서구",
  "衿川区": "금천구", "衿川": "금천구", "금천구": "금천구",
  "九老区": "구로구", "九老": "구로구", "구로구": "구로구",
  "冠岳区": "관악구", "관악구": "관악구",
  "铜雀区": "동작구", "铜雀": "동작구", "동작구": "동작구",
  "恩平区": "은평구", "은평구": "은평구",
  "江北区": "강북구", "江北": "강북구", "강북구": "강북구",
  "道峰区": "도봉구", "도봉구": "도봉구",
  "芦原区": "노원구", "노원구": "노원구",
  "中浪区": "중랑구", "중랑구": "중랑구",
  "江东区": "강동구", "江东": "강동구", "강동구": "강동구",
  "阳川区": "양천구", "양천구": "양천구",
}

// Map common area names → district
const AREA_TO_DISTRICT: Record<string, string> = {
  "弘大": "마포구", "홍대": "마포구", "合井": "마포구", "합정": "마포구",
  "上水": "마포구", "상수": "마포구", "望远": "마포구", "망원": "마포구",
  "延南": "마포구", "연남": "마포구",
  "狎鸥亭": "강남구", "압구정": "강남구", "清潭": "강남구", "청담": "강남구",
  "新沙": "강남구", "신사": "강남구", "论岘": "강남구", "논현": "강남구",
  "三成": "강남구", "삼성": "강남구", "大峙": "강남구", "대치": "강남구",
  "梨泰院": "용산구", "이태원": "용산구", "汉南": "용산구", "한남": "용산구",
  "解放村": "용산구", "해방촌": "용산구", "厚岩": "용산구", "후암": "용산구",
  "圣水": "성동구", "성수": "성동구", "纛岛": "성동구", "뚝섬": "성동구",
  "往十里": "성동구", "왕십리": "성동구",
  "明洞": "중구", "명동": "중구", "乙支路": "중구", "을지로": "중구",
  "会贤": "중구", "회현": "중구", "忠武路": "중구", "충무로": "중구",
  "景福宫": "종로구", "경복궁": "종로구", "北村": "종로구", "북촌": "종로구",
  "仁寺洞": "종로구", "인사동": "종로구", "三清洞": "종로구", "삼청동": "종로구",
  "大学路": "종로구", "대학로": "종로구", "光化门": "종로구", "광화문": "종로구",
  "汝矣岛": "영등포구", "여의도": "영등포구", "汝矣": "영등포구",
  "建大": "광진구", "건대": "광진구", "君子": "광진구", "군자": "광진구",
  "蚕室": "송파구", "잠실": "송파구", "乐天世界": "송파구", "롯데월드": "송파구",
  "文井": "송파구", "문정": "송파구",
  "高速巴士": "서초구", "고속터미널": "서초구", "盘浦": "서초구", "반포": "서초구",
  "良才": "서초구", "양재": "서초구",
}

interface ExtractionResult {
  title: string | null
  snippet: string | null
  url: string | null
  isShareText: boolean
  xhsLocation: string | null      // XHS post location tag
  subwayInfo: string | null       // extracted subway station info
  possibleDistrict: string | null // inferred district (Korean)
  possibleAddress: string | null  // explicitly found address
}

function parseXhsShareText(input: string): ExtractionResult {
  const result: ExtractionResult = {
    title: null, snippet: null, url: null, isShareText: false,
    xhsLocation: null, subwayInfo: null, possibleDistrict: null, possibleAddress: null,
  }

  // Try main XHS share pattern: 【Title】Description... URL
  const shareMatch = input.match(XHS_SHARE_PATTERN)
  if (shareMatch) {
    result.title = shareMatch[1].trim()
    result.snippet = (shareMatch[2] || "").replace(/【小红书】里有答案.*$/, "").trim()
    result.url = shareMatch[3]
    result.isShareText = true
  } else {
    const altMatch = input.match(XHS_ALT_PATTERN)
    if (altMatch && XHS_URL_PATTERN.test(altMatch[2])) {
      result.title = altMatch[1].replace(/【小红书】里有答案.*$/, "").trim().slice(0, 80)
      result.url = altMatch[2]
      result.isShareText = true
    } else {
      const urlMatch = input.match(/(https?:\/\/[^\s]+)/)
      result.url = urlMatch?.[1] || null
    }
  }

  // Build full text to analyze
  const fullText = [result.title, result.snippet, input].filter(Boolean).join(" ")

  // Extract XHS location tag: "— at XX·YY", "在 XX", "📍XX", "— 位于XX"
  const locTagPatterns = [
    /(?:—|—|at|在|位于|📍)\s*([^\s,，。…]{2,30}?(?:·[^\s,，。…]{2,20})?)/i,
    /(?:서울|首尔|釜山|부산|济州|제주)\s*[·⋅]\s*\S+/g,
  ]
  for (const p of locTagPatterns) {
    const m = fullText.match(p)
    if (m) { result.xhsLocation = m[1] || m[0]; break }
  }

  // Extract subway info: "X号出口", "XX站", "XX역"
  const subwayPatterns = [
    /(\S{1,4}(?:역|站)\s*\d*[호번]?\s*출구)/g,
    /(\S{1,3}号线?\s*\S{0,3}站)/g,
    /(exit\s*\d+)/gi,
    /(\S+역\s*\d+번\s*출구)/g,
  ]
  for (const p of subwayPatterns) {
    const m = fullText.match(p)
    if (m) { result.subwayInfo = m[0]; break }
  }

  // Try to extract explicit Korean address
  result.possibleAddress = extractKoreanAddress(fullText)

  // Infer district from text
  result.possibleDistrict = inferDistrict(fullText)

  return result
}

function extractKoreanAddress(text: string): string | null {
  const patterns = [
    // Full Korean address with city prefix
    /(?:서울|부산|인천|대구|대전|광주|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s*\S*?(?:특별시|광역시)?\s+\S{2,}[구군]\s+\S{2,}[동읍면리]?\s*(?:\S*[로길가]\s*)?\d*(?:[번\-]\d*)?(?:호|층)?/g,
    // District + dong + road + number
    /\S{2,}[구군]\s+\S{2,}[동읍면리]?\s*(?:\S*[로길가]\s*)?\d+(?:[번\-]\d+)?(?:호|층)?/g,
    // Chinese style: 首尔XX区XX洞/街/路
    /首尔(?:特别市|特别自治市)?\s*\S{2,}[区洞街路]\s*\S{2,}[洞街路号]?\s*\d*(?:-\d+)?(?:号|楼|层)?/g,
    // Road + building number: XX로 123 or XX길 45-6
    /\S{2,}[로길]\s+\d+(?:[번\-]\d+)?(?:호|층)?/g,
    // Dong + number: XX동 123-4
    /\S{2,}[동]\s+\d+(?:[번\-]\d+)?/g,
    // Labeled: 地址/위치/주소:
    /(?:地址|위치|주소|위치정보|장소)[:：]\s*(.+?)(?:[\n，。,.]|$)/gi,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const addr = m[0].trim()
      if (addr.length > 5 && addr.length < 120) return addr
    }
  }
  return null
}

function inferDistrict(text: string): string | null {
  // Check direct district mention (Chinese or Korean)
  for (const [cn, kr] of Object.entries(CN_TO_KR_DISTRICT)) {
    if (text.includes(cn)) return kr
  }
  // Check area names
  for (const [area, district] of Object.entries(AREA_TO_DISTRICT)) {
    if (text.includes(area)) return district
  }
  // Check if text mentions Seoul
  if (/서울|首尔/.test(text)) return "서울"
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
      // Extract everything we can from share text
      if (parsed.title && !locationName) setLocationName(parsed.title)
      if (parsed.snippet && !description) setDescription(parsed.snippet.slice(0, 200))

      // Build best address from available signals
      const addrParts: string[] = []
      if (parsed.possibleAddress) {
        addrParts.push(parsed.possibleAddress)
      } else if (parsed.possibleDistrict) {
        addrParts.push(parsed.possibleDistrict)
      }
      // If we have subway info but no address, use district+subway as hint
      if (parsed.subwayInfo && !parsed.possibleAddress) {
        addrParts.push(parsed.subwayInfo)
      }

      if (addrParts.length > 0 && !address) {
        setAddress(addrParts.join(" "))
      }

      const what = [
        parsed.title && "title",
        parsed.possibleAddress && "address",
        parsed.possibleDistrict && !parsed.possibleAddress && "district",
        parsed.subwayInfo && "subway",
        parsed.xhsLocation && "location tag",
      ].filter(Boolean)
      setParseMsg(what.length > 0 ? `Extracted: ${what.join(", ")}` : t("add_spot_parse_title_only"))
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
      // Plain text — try extraction
      const addr = extractKoreanAddress(xhsInput)
      const district = inferDistrict(xhsInput)
      if (addr && !address) setAddress(addr)
      else if (district && !address) setAddress(district)
      setParseMsg(
        addr || district
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

        {/* Quick district selector */}
        <div className="flex flex-wrap gap-1">
          {SEOUL_DISTRICTS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                const current = address.trim()
                const hasDistrict = SEOUL_DISTRICTS.some((x) => current.includes(x))
                if (hasDistrict) {
                  // Replace existing district
                  const parts = current.split(/\s+/)
                  const idx = parts.findIndex((p) => SEOUL_DISTRICTS.some((x) => p === x))
                  if (idx >= 0) parts[idx] = d
                  setAddress(parts.join(" "))
                } else {
                  setAddress(d + (current ? " " + current : ""))
                }
              }}
              className={`text-[10px] px-1.5 py-0.5 font-mono border transition ${
                address.includes(d)
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : "bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-500"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

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
