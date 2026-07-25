"use client"

import Link from "next/link"
import { useLang } from "@/components/LanguageProvider"

const STEPS = [
  {
    emoji: "🗺️",
    title: { en: "Explore the Map", zh: "探索地图" },
    desc: { en: "Browse 230+ Kpop spots across Seoul", zh: "浏览首尔 230+ 个追星打卡地" },
    href: "/locations",
    color: "#3b82f6",
  },
  {
    emoji: "💙",
    title: { en: "Find Your Fandom", zh: "找到本命团" },
    desc: { en: "Pick your favorite group and enter their House", zh: "选择你爱的团体，进入专属小屋" },
    href: "/groups",
    color: "#ec4899",
  },
  {
    emoji: "📝",
    title: { en: "Share Your Story", zh: "分享打卡" },
    desc: { en: "Post check-ins and share with fellow fans", zh: "发布打卡记录，和同好分享追星足迹" },
    href: "/auth/register",
    color: "#f59e0b",
  },
]

export default function QuickStart() {
  const { lang } = useLang()

  return (
    <div className="mb-8">
      <h2 className="text-center text-sm font-black text-slate-700 mb-4">
        {lang === "zh" ? "🚀 三步开始星旅" : "🚀 Get Started in 3 Steps"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {STEPS.map((step, i) => (
          <Link
            key={i}
            href={step.href}
            className="group relative bg-white rounded-2xl border-2 border-slate-100 p-4 text-center hover:border-blue-200 hover:shadow-md transition-all duration-200"
          >
            <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black"
              style={{ backgroundColor: step.color }}
            >
              {i + 1}
            </span>
            <div
              className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: step.color + "15" }}
            >
              {step.emoji}
            </div>
            <p className="font-bold text-sm text-slate-700 mb-1">{step.title[lang]}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc[lang]}</p>
            {i < 2 && (
              <span className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg">→</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
