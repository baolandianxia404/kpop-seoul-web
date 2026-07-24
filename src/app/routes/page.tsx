"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { locations } from "@/lib/data/locations"
import { useLang } from "@/components/LanguageProvider"
import { LOCATION_TYPES } from "@/lib/utils/constants"
import { getDistance } from "@/lib/utils/distance"
import PageGuide from "@/components/ui/PageGuide"

interface RouteSpot {
  id: string
  name: string
  type: string
  typeIcon: string
  typeColor: string
  subway?: string
  walkMin?: number
  lat: number
  lng: number
}

interface Route {
  district: string
  districtKo: string
  emoji: string
  description: string
  spots: RouteSpot[]
  totalTime: number
}

const districtMeta: Record<string, { ko: string; emoji: string; desc: string }> = {
  "麻浦区": { ko: "마포구", emoji: "🎵", desc: "弘大、合井，潮流街区" },
  "江南区": { ko: "강남구", emoji: "✨", desc: "狎鸥亭、清潭洞高端名店" },
  "龙山区": { ko: "용산구", emoji: "🏢", desc: "梨泰院、汉南洞，HYBE大本营" },
  "城东区": { ko: "성동구", emoji: "☕", desc: "圣水洞咖啡街+SM新大楼" },
  "中区": { ko: "중구", emoji: "🏰", desc: "明洞、乙支路购物天堂" },
  "钟路区": { ko: "종로구", emoji: "🏯", desc: "景福宫、北村韩屋MV拍摄地" },
  "永登浦区": { ko: "영등포구", emoji: "🛍️", desc: "汝矣岛+KBS电视台" },
  "广津区": { ko: "광진구", emoji: "🎬", desc: "建大+乐天世界拍摄地" },
}

function buildRoutes(): Route[] {
  const districtMap = new Map<string, RouteSpot[]>()
  for (const loc of locations) {
    const d = loc.location.district
    if (!districtMap.has(d)) districtMap.set(d, [])
    districtMap.get(d)!.push({
      id: loc.id,
      name: loc.name,
      type: loc.type,
      typeIcon: LOCATION_TYPES[loc.type]?.icon || "📍",
      typeColor: LOCATION_TYPES[loc.type]?.color || "#3b82f6",
      subway: loc.transport?.subway?.station,
      walkMin: loc.transport?.subway?.walkingMinutes,
      lat: loc.location.latitude,
      lng: loc.location.longitude,
    })
  }

  const routes: Route[] = []
  for (const [district, spots] of districtMap) {
    if (spots.length < 4) continue
    const meta = districtMeta[district]
    if (!meta) continue

    const avgLat = spots.reduce((s, x) => s + x.lat, 0) / spots.length
    const avgLng = spots.reduce((s, x) => s + x.lng, 0) / spots.length
    spots.sort((a, b) => getDistance(avgLat, avgLng, a.lat, a.lng) - getDistance(avgLat, avgLng, b.lat, b.lng))

    routes.push({
      district,
      districtKo: meta.ko,
      emoji: meta.emoji,
      description: meta.desc,
      spots,
      totalTime: spots.length * 25,
    })
  }
  return routes
}

export default function RoutesPage() {
  const { t } = useLang()
  const [addedSpots, setAddedSpots] = useState<Set<string>>(new Set())
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [savedCount, setSavedCount] = useState(0)
  const [openDistrict, setOpenDistrict] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  const routes = buildRoutes()
  const selectedRoute = routes.find((r) => r.district === openDistrict)

  useEffect(() => {
    if (openDistrict) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [openDistrict])

  const closeOverlay = () => {
    setVisible(false)
    setTimeout(() => setOpenDistrict(null), 250)
  }

  const addToPlan = (spot: RouteSpot) => {
    try {
      const stored = JSON.parse(localStorage.getItem("kpop_pending_spots") || "[]")
      if (!stored.some((s: { locationId: string }) => s.locationId === spot.id)) {
        stored.push({ locationId: spot.id, locationName: spot.name, locationType: spot.type })
        localStorage.setItem("kpop_pending_spots", JSON.stringify(stored))
      }
    } catch {}

    setAddedSpots((prev) => new Set(prev).add(spot.id))
    setSavedCount((c) => c + 1)
    setToastMsg(spot.name)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  // Card color palette
  const cardColors = [
    { bg: "#eff6ff", accent: "#3b82f6", border: "#bfdbfe" },
    { bg: "#fffbeb", accent: "#f59e0b", border: "#fde68a" },
    { bg: "#fdf2f8", accent: "#ec4899", border: "#fbcfe8" },
    { bg: "#ecfdf5", accent: "#10b981", border: "#a7f3d0" },
    { bg: "#f5f3ff", accent: "#8b5cf6", border: "#ddd6fe" },
    { bg: "#fef2f2", accent: "#ef4444", border: "#fecaca" },
    { bg: "#f0f9ff", accent: "#0ea5e9", border: "#bae6fd" },
    { bg: "#fff7ed", accent: "#f97316", border: "#fed7aa" },
  ]

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-[#f0f4ff] via-white to-[#fffdf0]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl animate-bounce-gentle">🗺️</span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              <span className="text-blue-500">Day</span>{" "}
              <span className="text-amber-500">Routes</span>
            </h1>
            <span className="text-3xl animate-bounce-gentle" style={{ animationDelay: "0.5s" }}>✨</span>
          </div>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-4">
            Tap a district to explore its Kpop route
          </p>

          <PageGuide pageKey="routes" emoji="🗺️" title="怎么用地区路线？">
            每个区都有按距离排好的路线。看到想去的地点点 <strong>+</strong> 加入清单，然后去 <Link href="/plan" className="text-blue-500 underline">规划页</Link> 一键生成你的专属行程～
          </PageGuide>

          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #3b82f6, #f59e0b)" }}
          >
            ✨ Want a personalized route? Customize your own →
          </Link>
          {savedCount > 0 && (
            <Link
              href="/saved"
              className="inline-block mt-3 px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition animate-pop-in"
            >
              ⭐ View My Plan ({savedCount} spots) →
            </Link>
          )}
        </div>

        {/* District card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {routes.map((route, i) => {
            const palette = cardColors[i % cardColors.length]
            return (
              <button
                key={route.district}
                onClick={() => setOpenDistrict(route.district)}
                className="group text-left p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] relative overflow-hidden"
                style={{
                  backgroundColor: palette.bg,
                  borderColor: palette.border,
                }}
              >
                {/* Decorative corner pixel */}
                <div className="absolute top-2 right-2 w-2 h-2 opacity-40" style={{ backgroundColor: palette.accent }} />
                <div className="absolute bottom-2 left-2 w-2 h-2 opacity-40" style={{ backgroundColor: palette.accent }} />

                <div className="text-3xl mb-3">{route.emoji}</div>
                <h3 className="font-black text-sm text-slate-800 mb-1">
                  {route.district}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mb-3">{route.districtKo}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed mb-3 line-clamp-2">
                  {route.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: palette.accent }}
                  >
                    {route.spots.length} spots
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="text-center mt-10 pb-4">
          <p className="text-xs text-gray-300 font-mono">
            ✨ Tap a card to explore · Add spots to your plan ✨
          </p>
        </div>
      </div>

      {/* Overlay modal for selected district */}
      {openDistrict && selectedRoute && (
        <div
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${
            visible ? "bg-black/40 backdrop-blur-sm" : "bg-transparent"
          }`}
          onClick={closeOverlay}
        >
          <div
            className={`relative bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[85dvh] overflow-y-auto transition-all duration-300 ease-out ${
              visible ? "translate-y-0 sm:scale-100 opacity-100" : "translate-y-full sm:translate-y-8 sm:scale-95 opacity-0"
            }`}
            style={{
              boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedRoute.emoji}</span>
                  <div>
                    <h2 className="text-lg font-black pixel-font text-slate-800">
                      {selectedRoute.district}
                      <span className="text-xs text-slate-400 font-normal ml-1.5">{selectedRoute.districtKo}</span>
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      📍 {selectedRoute.spots.length} spots · ⏱ ~{Math.floor(selectedRoute.totalTime / 60)}h
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeOverlay}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition font-mono text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-5 py-4">
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />

                <div className="space-y-1">
                  {selectedRoute.spots.map((spot, i) => (
                    <div
                      key={spot.id}
                      className="flex items-center gap-3 px-2 py-2.5 hover:bg-blue-50 transition group relative rounded-lg"
                    >
                      <div className="relative z-10 w-[30px] flex-shrink-0 flex justify-center">
                        <div
                          className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: spot.typeColor }}
                        />
                      </div>

                      <Link
                        href={`/locations/${spot.id}`}
                        className="flex-1 min-w-0 flex items-center gap-2"
                        onClick={closeOverlay}
                      >
                        <span className="text-sm">{spot.typeIcon}</span>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-500 transition truncate">
                          {spot.name}
                        </span>
                        {spot.subway && (
                          <span className="hidden sm:inline text-[10px] text-slate-300 font-mono flex-shrink-0">
                            🚇 {spot.subway}
                            {spot.walkMin && ` ${spot.walkMin}min`}
                          </span>
                        )}
                      </Link>

                      <button
                        onClick={(e) => { e.preventDefault(); addToPlan(spot) }}
                        className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-bold font-mono rounded-lg transition ${
                          addedSpots.has(spot.id)
                            ? "bg-amber-100 text-amber-600"
                            : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
                        }`}
                      >
                        {addedSpots.has(spot.id) ? "✓" : "+"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-3 text-center">
              <button
                onClick={closeOverlay}
                className="text-xs font-mono text-slate-400 hover:text-slate-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 bg-slate-800 text-white text-xs font-mono rounded-full shadow-lg animate-pop-in">
          ⭐ Added to plan: {toastMsg}
        </div>
      )}
    </div>
  )
}
