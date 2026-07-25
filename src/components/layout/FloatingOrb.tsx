"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useLang } from "@/components/LanguageProvider"

const MENU_ITEMS = [
  { href: "/planner", icon: "📝", label: { en: "Share", zh: "投稿" }, color: "bg-amber-400", anim: "animate-pop-bounce" },
  { href: "/plan", icon: "🗺️", label: { en: "Plan", zh: "规划路线" }, color: "bg-blue-400", anim: "animate-pop-spin" },
  { href: "/saved", icon: "⭐", label: { en: "Saved", zh: "收藏" }, color: "bg-pink-400", anim: "animate-pop-swing" },
]

const BURST_OFFSETS = [
  { x: -56, y: -72 },
  { x: 0, y: -88 },
  { x: 56, y: -72 },
]

export default function FloatingOrb() {
  const [open, setOpen] = useState(false)
  const [burst, setBurst] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lang } = useLang()

  useEffect(() => {
    if (!open) {
      setBurst(false)
      return
    }
    // Delay burst to let the "pop" animation play
    const t = setTimeout(() => setBurst(true), 150)
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)
    return () => {
      clearTimeout(t)
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [open])

  const handleToggle = () => {
    if (open) {
      setBurst(false)
      setTimeout(() => setOpen(false), 100)
    } else {
      setOpen(true)
    }
  }

  return (
    <div ref={containerRef} className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px]"
          style={{ zIndex: -1 }}
          onClick={handleToggle}
        />
      )}

      {/* Menu bubbles */}
      {MENU_ITEMS.map((item, i) => (
        <div
          key={item.href}
          className="absolute left-1/2 flex flex-col items-center gap-1.5 transition-all duration-500 ease-out"
          style={{
            transform: burst
              ? `translate(calc(-50% + ${BURST_OFFSETS[i].x}px), ${BURST_OFFSETS[i].y}px) scale(1)`
              : "translate(-50%, 0) scale(0)",
            opacity: burst ? 1 : 0,
            transitionDelay: burst ? `${i * 80}ms` : "0ms",
            bottom: 28,
          }}
        >
          <span className={`text-[10px] font-bold text-slate-500 bg-white/95 px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap ${burst ? item.anim : ""}`}
            style={{ animationDelay: `${300 + i * 100}ms` }}
          >
            {item.label[lang]}
          </span>
          <Link
            href={item.href}
            onClick={() => setOpen(false)}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-lg transition-transform active:scale-90 ${item.color} ${burst ? item.anim : ""}`}
            style={{ animationDelay: `${200 + i * 100}ms` }}
          >
            {item.icon}
          </Link>
        </div>
      ))}

      {/* Main rabbit bubble */}
      <button
        onClick={handleToggle}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${open ? "" : "animate-bunny-hop"}`}
        style={{
          background: "linear-gradient(135deg, #fff 0%, #fef3c7 40%, #fde68a 100%)",
        }}
      >
        {/* Shine */}
        <span className="absolute top-1.5 left-3 w-2 h-2 rounded-full bg-white/80" />
        {/* Bunny */}
        <span className={open ? "animate-pop-in" : ""}>🐰</span>
      </button>
    </div>
  )
}
