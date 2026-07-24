"use client"

import { useState } from "react"
import Link from "next/link"
import { locations } from "@/lib/data/locations"
import { useLang } from "@/components/LanguageProvider"
import { LOCATION_TYPES } from "@/lib/utils/constants"
import { getDistance } from "@/lib/utils/distance"

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
  "麻浦区": { ko: "마포구", emoji: "🎵", desc: "弘大、合井、上水一带，年轻人最爱的潮流街区，爱豆常去的咖啡厅和餐厅密集。" },
  "江南区": { ko: "강남구", emoji: "✨", desc: "狎鸥亭、清潭洞、新沙洞，高端时尚+娱乐公司+爱豆同款名店。" },
  "龙山区": { ko: "용산구", emoji: "🏢", desc: "梨泰院、汉南洞，HYBE大楼所在地，国际化氛围+网红打卡地。" },
  "城东区": { ko: "성동구", emoji: "☕", desc: "圣水洞咖啡街，旧工厂改造的艺术区，SM新大楼也在这里。" },
  "中区": { ko: "중구", emoji: "🏰", desc: "明洞、乙支路，购物天堂+经典追星地标。" },
  "钟路区": { ko: "종로구", emoji: "🏯", desc: "景福宫、北村、仁寺洞，传统文化+韩服体验+MV拍摄地。" },
  "永登浦区": { ko: "영등포구", emoji: "🛍️", desc: "汝矣岛、KBS，汉江公园+电视台打卡。" },
  "广津区": { ko: "광진구", emoji: "🎬", desc: "建大入口、乐天世界，大型娱乐设施+拍摄地。" },
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

  const routes = buildRoutes()

  const addToPlan = (spot: RouteSpot) => {
    try {
      const stored = JSON.parse(localStorage.getItem("kpop_pending_spots") || "[]")
      if (!stored.some((s: { locationId: string }) => s.locationId === spot.id)) {
        stored.push({
          locationId: spot.id,
          locationName: spot.name,
          locationType: spot.type,
        })
        localStorage.setItem("kpop_pending_spots", JSON.stringify(stored))
      }
    } catch {}

    setAddedSpots((prev) => new Set(prev).add(spot.id))
    setSavedCount((c) => c + 1)
    setToastMsg(spot.name)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-[#f0f4ff] via-white to-[#fffdf0]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl animate-bounce-gentle">🗺️</span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              <span className="text-blue-500">Day</span>{" "}
              <span className="text-amber-500">Routes</span>
            </h1>
            <span className="text-3xl animate-bounce-gentle" style={{ animationDelay: "0.5s" }}>✨</span>
          </div>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-4">
            Pick an area, add spots to your plan, follow the route!
          </p>
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

        {/* Routes grid */}
        <div className="space-y-6">
          {routes.map((route) => (
            <div key={route.district} className="pixel-card bg-white overflow-hidden">
              <div className="p-5 border-b-2 border-slate-100 flex items-start justify-between flex-wrap gap-3"
                style={{ borderLeft: "4px solid #3b82f6" }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{route.emoji}</span>
                    <h2 className="text-lg font-black pixel-font text-slate-800">
                      {route.district}
                      <span className="text-xs text-slate-400 font-normal ml-1">{route.districtKo}</span>
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-lg">{route.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>📍 {route.spots.length} spots</span>
                  <span>⏱ ~{Math.floor(route.totalTime / 60)}h{route.totalTime % 60 > 0 ? ` ${route.totalTime % 60}m` : ""}</span>
                </div>
              </div>

              <div className="p-3">
                <div className="relative">
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100" />

                  <div className="space-y-1">
                    {route.spots.map((spot, i) => (
                      <div
                        key={spot.id}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition group relative"
                      >
                        <div className="relative z-10 w-[38px] flex-shrink-0 flex justify-center">
                          <div
                            className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: spot.typeColor }}
                          />
                        </div>

                        <Link
                          href={`/locations/${spot.id}`}
                          className="flex-1 min-w-0 flex items-center gap-2"
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
                          className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-bold font-mono transition ${
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
            </div>
          ))}
        </div>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 bg-slate-800 text-white text-xs font-mono rounded-full shadow-lg animate-pop-in">
            ⭐ Added to plan: {toastMsg}
          </div>
        )}

        <div className="text-center mt-10 pb-4">
          <p className="text-xs text-gray-300 font-mono">
            ✨ Click + to add spots to your plan · View all in ⭐ Saved ✨
          </p>
        </div>
      </div>
    </div>
  )
}
