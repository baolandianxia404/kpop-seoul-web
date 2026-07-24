"use client"

import { useState } from "react"
import Link from "next/link"
import SearchDialog from "./SearchDialog"
import { useAuth } from "@/components/auth/AuthProvider"
import { useLang } from "@/components/LanguageProvider"
import UserMenu from "@/components/auth/UserMenu"
import PixelLogo from "@/components/PixelLogo"

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, loading } = useAuth()
  const { t, lang, toggleLang } = useLang()

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-blue-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex-shrink-0 transition-transform group-hover:scale-110 duration-200">
              <PixelLogo size={36} />
            </div>
            <span className="font-bold text-lg hidden sm:block pixel-font">
              <span className="text-blue-500">星旅</span>
              <span className="text-gray-400 font-normal text-xs ml-1">StarTrail</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-blue-500 transition font-medium">🗺 {t("header_map")}</Link>
            <Link href="/locations" className="text-sm text-gray-500 hover:text-blue-500 transition font-medium">📍 {t("header_locations")}</Link>
            <Link href="/groups" className="text-sm text-gray-500 hover:text-blue-500 transition font-medium">
              💙 {t("header_groups")}
            </Link>
            <Link href="/planner" className="text-sm text-gray-500 hover:text-blue-500 transition font-medium">📌 {t("header_add_spot")}</Link>
            <Link href="/plan" className="text-sm text-gray-500 hover:text-blue-500 transition font-medium">✨ {t("header_plan")}</Link>
            <Link href="/routes" className="text-sm text-gray-500 hover:text-blue-500 transition font-medium">🗺️ {t("header_routes")}</Link>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition font-mono text-slate-400"
            >
              {lang === "zh" ? "EN" : "中"}
            </button>

            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link href="/auth/login" className="text-sm text-slate-500 hover:text-blue-500 font-mono">
                    {t("header_sign_in")}
                  </Link>
                  <Link href="/auth/register" className="px-4 py-1.5 btn-accent text-xs font-semibold rounded-xl">
                    {t("header_join")}
                  </Link>
                </div>
              )
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLang}
              className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:border-blue-300 transition font-mono text-slate-400"
            >
              {lang === "zh" ? "EN" : "中"}
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-400 hover:text-blue-500 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
