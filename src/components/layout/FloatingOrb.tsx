"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useLang } from "@/components/LanguageProvider"

interface MenuItem {
  href: string
  icon: string
  label: { en: string; zh: string }
  color: string
}

const MENU_ITEMS: MenuItem[] = [
  { href: "/planner", icon: "📝", label: { en: "Share", zh: "投稿" }, color: "#f59e0b" },
  { href: "/plan", icon: "🗺️", label: { en: "Plan", zh: "规划路线" }, color: "#3b82f6" },
  { href: "/saved", icon: "⭐", label: { en: "Saved", zh: "收藏" }, color: "#ec4899" },
]

export default function FloatingOrb() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lang } = useLang()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [open])

  return (
    <div ref={containerRef} className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px]"
          style={{ zIndex: -1 }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Fan menu + orb container */}
      <div className="relative">
        {MENU_ITEMS.map((item, i) => {
          const spreadAngle = 40 // total spread in degrees
          const startAngle = -90 - spreadAngle / 2
          const angle = startAngle + (i / (MENU_ITEMS.length - 1)) * spreadAngle
          const radius = 90
          const x = Math.cos((angle * Math.PI) / 180) * radius
          const y = Math.sin((angle * Math.PI) / 180) * radius

          return (
            <div
              key={item.href}
              className="absolute left-1/2 flex flex-col items-center gap-1 transition-all duration-300 ease-out"
              style={{
                transform: open
                  ? `translate(calc(-50% + ${x}px), ${y}px) scale(1)`
                  : "translate(-50%, 0) scale(0)",
                opacity: open ? 1 : 0,
                transitionDelay: open ? `${i * 60}ms` : `${(2 - i) * 40}ms`,
                bottom: 24,
              }}
            >
              <span className="text-[10px] font-bold text-slate-600 bg-white/90 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                {item.label[lang]}
              </span>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg transition-transform hover:scale-115 active:scale-95"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
              </Link>
            </div>
          )
        })}

        {/* Orb button */}
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
          className="relative w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #6366f1 100%)",
          }}
        >
          {/* Star trail ring */}
          <span
            className="absolute inset-0 rounded-full animate-spin-slow"
            style={{
              background: `conic-gradient(from 0deg, transparent 70%, rgba(251,191,36,0.4) 85%, transparent 100%)`,
              mask: "radial-gradient(circle, transparent 58%, black 60%)",
              WebkitMask: "radial-gradient(circle, transparent 58%, black 60%)",
            }}
          />

          {/* Breathing glow */}
          <span className="absolute inset-0 rounded-full animate-pulse-glow" />

          {/* Icon */}
          <span className="relative z-10 text-sm transition-transform duration-300" style={{ transform: open ? "rotate(45deg)" : "" }}>
            ✦
          </span>
        </button>
      </div>
    </div>
  )
}
