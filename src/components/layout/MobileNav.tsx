"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { useLang } from "@/components/LanguageProvider"

export default function MobileNav() {
  const pathname = usePathname()
  const { user, profile } = useAuth()
  const { t } = useLang()

  const houseHref = profile?.fan_group_id ? `/groups/${profile.fan_group_id}/house` : "/auth/login"

  const navItems = [
    { href: "/", label: t("nav_map"), icon: "🗺️", match: "/" },
    { href: "/locations", label: t("nav_locations"), icon: "📍", match: "/locations" },
    { href: "/planner", label: t("nav_planner"), icon: "📌", match: "/planner" },
    { href: "/groups", label: t("nav_groups"), icon: "💜", match: "/groups" },
    ...(user ? [{ href: houseHref, label: t("nav_house"), icon: "🏠", match: "/house" }] : []),
    { href: "/saved", label: t("nav_saved"), icon: "⭐", match: "/saved" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-blue-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon, match }) => {
          const active = pathname === href || (match === "/" && pathname === "/") || (match === "/house" && pathname.includes("/house"))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-200 ${
                active ? "text-blue-500 scale-110" : "text-gray-400 hover:text-gray-500"
              }`}
            >
              <span className={`text-lg ${active ? "animate-bounce-gentle" : ""}`}>{icon}</span>
              <span className="text-[10px] font-semibold">{label}</span>
              {active && <div className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
