"use client"

import Link from "next/link"
import { useLang } from "@/components/LanguageProvider"
import { FEATURED_ROUTES } from "@/lib/data/featured-routes"
import { locations } from "@/lib/data/locations"

export default function FeaturedRoutes() {
  const { lang } = useLang()

  return (
    <div className="mb-8">
      <h2 className="text-center text-sm font-black text-slate-700 mb-4 flex items-center justify-center gap-2">
        <span>🗺️</span>
        {lang === "zh" ? "精选追星路线" : "Featured Routes"}
        <span>🗺️</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {FEATURED_ROUTES.map((route) => {
          const spotCount = route.locationIds.filter((id) =>
            locations.some((l) => l.id === id)
          ).length
          return (
            <Link
              key={route.id}
              href={`/routes/${route.id}`}
              className="group block bg-white rounded-2xl border-2 border-slate-100 p-4 hover:border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{route.emoji}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full text-white font-mono font-bold"
                  style={{ backgroundColor: route.color }}
                >
                  {spotCount} {lang === "zh" ? "个地点" : "spots"}
                </span>
              </div>
              <p className="font-bold text-sm text-slate-700 mb-1">{route.title[lang]}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{route.desc[lang]}</p>
              <span className="text-xs text-blue-400 font-mono group-hover:underline">
                {lang === "zh" ? "查看路线 →" : "View route →"}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
