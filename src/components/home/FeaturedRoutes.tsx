"use client"

import Link from "next/link"
import { useLang } from "@/components/LanguageProvider"

const ROUTES = [
  {
    emoji: "🏢",
    title: { en: "SM Entertainment Pilgrimage", zh: "SM 娱乐朝圣路线" },
    desc: { en: "KWANGYA → SM Building → SUM Cafe → COEX", zh: "KWANGYA → SM 大楼 → SUM 咖啡厅 → COEX" },
    spots: 4,
    color: "#ec4899",
  },
  {
    emoji: "☕",
    title: { en: "Hongdae Idol Cafe Tour", zh: "弘大爱豆咖啡巡礼" },
    desc: { en: "Haru Coffee → Yeonnam-dong → Hongdae street", zh: "Haru 咖啡 → 延南洞 → 弘大街头" },
    spots: 5,
    color: "#f59e0b",
  },
  {
    emoji: "🎬",
    title: { en: "Iconic MV Film Spots", zh: "经典 MV 取景地" },
    desc: { en: "Hybe Insight → Namsan → Banpo Bridge → Hangang", zh: "HYBE 博物馆 → 南山 → 盘浦大桥 → 汉江" },
    spots: 4,
    color: "#3b82f6",
  },
]

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
        {ROUTES.map((route, i) => (
          <Link
            key={i}
            href="/plan"
            className="group block bg-white rounded-2xl border-2 border-slate-100 p-4 hover:border-blue-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{route.emoji}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full text-white font-mono font-bold"
                style={{ backgroundColor: route.color }}
              >
                {route.spots} {lang === "zh" ? "个地点" : "spots"}
              </span>
            </div>
            <p className="font-bold text-sm text-slate-700 mb-1">{route.title[lang]}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{route.desc[lang]}</p>
            <span className="text-xs text-blue-400 font-mono group-hover:underline">
              {lang === "zh" ? "规划路线 →" : "Plan route →"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
