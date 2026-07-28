"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { groups } from "@/lib/data/groups"

interface DrawerItemData {
  href: string
  icon: string
  zh: string
  en: string
  match?: string
}

const CORE_ITEMS: DrawerItemData[] = [
  { href: "/", icon: "🗺️", zh: "星图", en: "StarMap", match: "/" },
  { href: "/locations", icon: "📍", zh: "地点", en: "Spots" },
  { href: "/groups", icon: "💙", zh: "团体", en: "Groups" },
]

const EXTRA_ITEMS: DrawerItemData[] = [
  { href: "/planner", icon: "📝", zh: "投稿", en: "Share" },
  { href: "/plan", icon: "🗺️", zh: "爱豆路线", en: "Idol Routes" },
  { href: "/routes", icon: "🧭", zh: "地区路线", en: "Districts" },
  { href: "/saved", icon: "⭐", zh: "收藏", en: "Saved" },
]

const DRAWER_DOTS = [
  { color: "#3b82f6", size: 10, x: "5%", y: "8%", delay: "0s" },
  { color: "#f59e0b", size: 6, x: "85%", y: "12%", delay: "0.5s" },
  { color: "#ec4899", size: 8, x: "10%", y: "70%", delay: "0.3s" },
  { color: "#8b5cf6", size: 12, x: "80%", y: "55%", delay: "0.7s" },
  { color: "#10b981", size: 6, x: "50%", y: "88%", delay: "0.4s" },
  { color: "#f59e0b", size: 9, x: "60%", y: "15%", delay: "1s" },
  { color: "#3b82f6", size: 7, x: "30%", y: "45%", delay: "0.6s" },
  { color: "#ec4899", size: 5, x: "90%", y: "38%", delay: "0.9s" },
]

const DRAWER_EMOJIS = [
  { emoji: "💙", x: "15%", y: "22%", delay: "0s" },
  { emoji: "⭐", x: "78%", y: "32%", delay: "1s" },
  { emoji: "✨", x: "10%", y: "52%", delay: "0.5s" },
  { emoji: "🎀", x: "75%", y: "78%", delay: "1.2s" },
]

export default function SideDrawer() {
  const [open, setOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()

  const fanGroup = groups.find((g) => g.id === profile?.fan_group_id)
  const initials = (profile?.display_name || user?.email || "?").slice(0, 2).toUpperCase()

  const houseHref = profile?.fan_group_id ? `/groups/${profile.fan_group_id}/house` : "/auth/login"

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [open])

  const isActive = (item: DrawerItemData) => {
    if (item.match === "/") return pathname === "/"
    if (item.href === "/house") return pathname.includes("/house")
    return pathname.startsWith(item.href)
  }

  return (
    <div className="md:hidden">
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[999]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 bottom-0 right-0 w-60 z-[1000] transition-transform duration-300 ease-out shadow-2xl overflow-hidden ${
          open ? "translate-x-0 rounded-l-2xl" : "translate-x-full"
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
          <div className="flex items-center justify-between px-5 pt-6 pb-3">
            <div>
              <span className="text-sm font-black text-slate-700">菜单</span>
              <span className="text-[10px] text-slate-400 font-mono ml-2">Menu</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition shadow-sm active:scale-90"
            >
              ✕
            </button>
          </div>

          {/* Core nav items */}
          <div className="px-3 mb-2">
            {CORE_ITEMS.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
                    active
                      ? "bg-blue-50 text-blue-500 font-bold"
                      : "text-slate-600 hover:bg-white/70"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold">{item.zh}</span>
                    <span className="text-[10px] text-slate-400 font-mono">· {item.en}</span>
                  </div>
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </Link>
              )
            })}
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-slate-100" />

          {/* Extra items */}
          <div className="px-3 mt-2 flex-1">
            {user && (
              <>
                {/* User info card */}
                <div className="px-4 py-3 mb-2 bg-white/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: fanGroup?.color || "#3b82f6" }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-700 truncate">
                          {profile?.display_name || user.email}
                        </p>
                        {fanGroup && (
                          <span
                            className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] text-white font-mono"
                            style={{ backgroundColor: fanGroup.color }}
                          >
                            {fanGroup.name}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-sm text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition"
                      >
                        ⚙️
                      </Link>
                      <button
                        onClick={() => { setOpen(false); signOut() }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-sm text-slate-300 hover:text-red-400 hover:bg-red-50 transition"
                      >
                        🚪
                      </button>
                    </div>
                  </div>
                </div>
                <DrawerRow
                  href={houseHref}
                  icon="🏠"
                  zh="小屋"
                  en="House"
                  active={isActive({ href: "/house", icon: "", zh: "", en: "" })}
                  onClick={() => setOpen(false)}
                />
              </>
            )}
            {EXTRA_ITEMS.map((item) => (
              <DrawerRow
                key={item.href}
                href={item.href}
                icon={item.icon}
                zh={item.zh}
                en={item.en}
                active={isActive(item)}
                onClick={() => setOpen(false)}
              />
            ))}
            {!user && (
              <DrawerRow
                href="/auth/register"
                icon="🌟"
                zh="注册"
                en="Join"
                active={false}
                onClick={() => setOpen(false)}
              />
            )}
          </div>

          {/* Footer */}
          <div className="text-center pb-6 pt-2">
            <p className="text-[10px] text-slate-300 font-mono">🐰 星旅 · StarTrail</p>
          </div>
        </div>
      </div>

      {/* Handle tab */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-[999] w-7 h-14 bg-white/90 backdrop-blur rounded-l-xl shadow-lg border border-r-0 border-slate-200 flex items-center justify-center transition-all duration-300 active:bg-blue-50 ${
          open ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        <span className="text-slate-400 text-xs">✦</span>
      </button>
    </div>
  )
}

function DrawerRow({
  href,
  icon,
  zh,
  en,
  active,
  onClick,
}: {
  href: string
  icon: string
  zh: string
  en: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] ${
        active
          ? "bg-blue-50 text-blue-500 font-bold"
          : "text-slate-600 hover:bg-white/70"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-bold">{zh}</span>
        <span className="text-[10px] text-slate-400 font-mono">· {en}</span>
      </div>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
    </Link>
  )
}
