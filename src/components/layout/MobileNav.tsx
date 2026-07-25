"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLang } from "@/components/LanguageProvider"

interface NavItem {
  href: string
  label: string
  icon: string
  match: string
}

export default function MobileNav() {
  const pathname = usePathname()
  const { t } = useLang()

  const navItems: NavItem[] = [
    { href: "/", label: t("nav_map"), icon: "🗺️", match: "/" },
    { href: "/locations", label: t("nav_locations"), icon: "📍", match: "/locations" },
    { href: "/groups", label: t("nav_groups"), icon: "💙", match: "/groups" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-blue-50 safe-area-bottom">
      <div className="grid grid-cols-3 h-16">
        {navItems.map(({ href, label, icon, match }) => {
          const active = pathname === href || (match === "/" && pathname === "/")
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all duration-200 ${
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
