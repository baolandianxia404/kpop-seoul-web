"use client"

import { useState } from "react"
import Link from "next/link"
import SearchDialog from "./SearchDialog"

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <span className="font-bold text-lg hidden sm:block">Kpop Seoul Map</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-purple-600 transition">
              Map
            </Link>
            <Link href="/locations" className="text-sm text-gray-600 hover:text-purple-600 transition">
              Locations
            </Link>
            <Link href="/groups" className="text-sm text-gray-600 hover:text-purple-600 transition">
              Groups
            </Link>
            <Link href="/planner" className="text-sm text-gray-600 hover:text-purple-600 transition">
              Planner
            </Link>
            <Link
              href="/planner"
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition"
            >
              Plan My Trip
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700"
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
