"use client"

import { useState } from "react"
import Link from "next/link"
import SearchDialog from "./SearchDialog"

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-blue-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm gradient-cute shadow-sm group-hover:shadow-md transition-shadow">
              K
            </div>
            <span className="font-bold text-lg hidden sm:block">
              <span className="text-blue-500">Kpop</span>{" "}
              <span className="text-amber-500">Seoul</span>{" "}
              <span className="text-gray-400 font-normal text-sm">Map</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-blue-500 transition font-medium">
              🗺 Map
            </Link>
            <Link href="/locations" className="text-sm text-gray-500 hover:text-blue-500 transition font-medium">
              📍 Locations
            </Link>
            <Link href="/groups" className="text-sm text-gray-500 hover:text-blue-500 transition font-medium">
              💜 Groups
            </Link>
            <Link href="/planner" className="text-sm text-gray-500 hover:text-blue-500 transition font-medium">
              ✨ Planner
            </Link>
            <Link
              href="/planner"
              className="px-5 py-2 btn-cute text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Plan My Trip
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-400 hover:text-blue-500 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
