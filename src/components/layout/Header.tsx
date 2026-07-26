"use client"

import { useState } from "react"
import Link from "next/link"
import SearchDialog from "./SearchDialog"
import { useAuth } from "@/components/auth/AuthProvider"
import { useLang } from "@/components/LanguageProvider"
import UserMenu from "@/components/auth/UserMenu"
import PixelLogo from "@/components/PixelLogo"
import StarTravelers from "@/components/ui/StarTravelers"

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, profile, loading } = useAuth()
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
            <span className="hidden sm:block">
              <StarTravelers />
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

          {/* Mobile: hamburger menu */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={toggleLang}
              className="text-xs px-1.5 py-1 rounded-lg border border-slate-200 hover:border-blue-300 transition font-mono text-slate-400"
            >
              {lang === "zh" ? "EN" : "中"}
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-400 hover:text-blue-500 transition"
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 text-gray-400 hover:text-blue-500 transition"
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile slide-out menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-sm text-slate-700">菜单</span>
              <button onClick={() => setMenuOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {!loading && (
                user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {(profile?.display_name || user.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {profile?.display_name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-sm text-slate-600">
                      👤 {t("header_profile")}
                    </Link>
                    <Link href="/saved" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-sm text-slate-600">
                      💾 {t("header_saved")}
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={async () => {
                        const { createClient } = await import("@/lib/supabase/client")
                        await createClient().auth.signOut()
                        setMenuOpen(false)
                        window.location.href = "/"
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition text-sm text-red-500 w-full"
                    >
                      🚪 {t("header_sign_out")}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-400 px-1 mb-3">加入星旅，记录你的追星足迹</p>
                    <Link
                      href="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full py-2.5 text-center bg-blue-500 text-white font-bold rounded-xl text-sm"
                    >
                      {t("header_sign_in")}
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full py-2.5 text-center border-2 border-blue-500 text-blue-500 font-bold rounded-xl text-sm"
                    >
                      {t("header_join")}
                    </Link>
                  </>
                )
              )}
              <hr className="my-2" />
              <Link href="/locations" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-sm text-slate-600">
                📍 {t("header_locations")}
              </Link>
              <Link href="/groups" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-sm text-slate-600">
                💙 {t("header_groups")}
              </Link>
              <Link href="/routes" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-sm text-slate-600">
                🗺️ {t("header_routes")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
