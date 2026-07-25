"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"

interface DrawerItemData {
  href: string
  icon: string
  zh: string
  en: string
}

const ITEMS: DrawerItemData[] = [
  { href: "/house", icon: "🏠", zh: "小屋", en: "House" },
  { href: "/saved", icon: "⭐", zh: "收藏", en: "Saved" },
  { href: "/planner", icon: "📝", zh: "投稿", en: "Share" },
  { href: "/plan", icon: "🗺️", zh: "规划路线", en: "Plan" },
  { href: "/auth/register", icon: "🌟", zh: "注册", en: "Join" },
]

// Background dots — smaller set for the drawer
const DRAWER_DOTS = [
  { color: "#3b82f6", size: 10, x: "5%", y: "8%", delay: "0s" },
  { color: "#f59e0b", size: 6, x: "85%", y: "12%", delay: "0.5s" },
  { color: "#ec4899", size: 8, x: "10%", y: "75%", delay: "0.3s" },
  { color: "#8b5cf6", size: 12, x: "80%", y: "60%", delay: "0.7s" },
  { color: "#10b981", size: 6, x: "50%", y: "90%", delay: "0.4s" },
  { color: "#f59e0b", size: 9, x: "60%", y: "15%", delay: "1s" },
  { color: "#3b82f6", size: 7, x: "30%", y: "50%", delay: "0.6s" },
  { color: "#ec4899", size: 5, x: "90%", y: "40%", delay: "0.9s" },
]

const DRAWER_EMOJIS = [
  { emoji: "💙", x: "15%", y: "25%", delay: "0s" },
  { emoji: "⭐", x: "78%", y: "35%", delay: "1s" },
  { emoji: "✨", x: "10%", y: "55%", delay: "0.5s" },
  { emoji: "🎀", x: "75%", y: "80%", delay: "1.2s" },
]

export default function SideDrawer() {
  const [open, setOpen] = useState(false)
  const { user, profile } = useAuth()

  const houseHref = profile?.fan_group_id ? `/groups/${profile.fan_group_id}/house` : "/auth/login"

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [open])

  const visibleItems = ITEMS.filter((item) => {
    if (item.href === "/house") return !!user
    if (item.href === "/auth/register") return !user
    return true
  }).map((item) => {
    if (item.href === "/house") return { ...item, href: houseHref }
    return item
  })

  return (
    <div className="md:hidden">
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 bottom-0 right-0 w-60 z-50 transition-transform duration-300 ease-out rounded-l-2xl shadow-2xl overflow-hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Animated dot background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f4ff] via-white to-[#fffdf0]">
          {DRAWER_DOTS.map((d, i) => (
            <span
              key={`dd-${i}`}
              className="absolute rounded-full pointer-events-none animate-float opacity-60"
              style={{
                left: d.x, top: d.y, width: d.size, height: d.size,
                backgroundColor: d.color, animationDelay: d.delay,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            />
          ))}
          {DRAWER_EMOJIS.map((e, i) => (
            <span
              key={`de-${i}`}
              className="absolute text-base pointer-events-none animate-float select-none opacity-50"
              style={{
                left: e.x, top: e.y, animationDelay: e.delay,
                animationDuration: `${3.5 + (i % 3)}s`,
              }}
            >
              {e.emoji}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <div>
              <span className="text-sm font-black text-slate-700">菜单</span>
              <span className="text-[10px] text-slate-400 font-mono ml-2">Menu</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition shadow-sm"
            >
              ✕
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 px-3 flex flex-col gap-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-600 hover:bg-white/70 hover:text-blue-500 transition-all duration-200 group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold">{item.zh}</span>
                  <span className="text-[10px] text-slate-400 font-mono">· {item.en}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center pb-6">
            <p className="text-[10px] text-slate-300 font-mono">🐰 星旅 · StarTrail</p>
          </div>
        </div>
      </div>

      {/* Handle tab */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 w-7 h-16 bg-white/90 backdrop-blur rounded-l-xl shadow-lg border border-r-0 border-slate-200 flex items-center justify-center transition-all duration-300 hover:w-8 hover:bg-blue-50 ${
          open ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        <span className="text-slate-400 text-xs">✦</span>
      </button>
    </div>
  )
}
