"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/", label: "Map", icon: "🗺️" },
  { href: "/locations", label: "Spots", icon: "📍" },
  { href: "/planner", label: "Plan", icon: "✨" },
  { href: "/groups", label: "Groups", icon: "💜" },
  { href: "/saved", label: "Saved", icon: "⭐" },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-blue-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 ${
                active
                  ? "text-blue-500 scale-110"
                  : "text-gray-400 hover:text-gray-500"
              }`}
            >
              <span className={`text-lg ${active ? "animate-bounce-gentle" : ""}`}>
                {icon}
              </span>
              <span className="text-[10px] font-semibold">{label}</span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
