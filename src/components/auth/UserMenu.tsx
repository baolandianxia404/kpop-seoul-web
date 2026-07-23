"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "./AuthProvider"
import { groups } from "@/lib/data/groups"

export default function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  if (!user) return null

  const fanGroup = groups.find((g) => g.id === profile?.fan_group_id)
  const initials = (profile?.display_name || user.email || "?").slice(0, 2).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-blue-50 transition"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: fanGroup?.color || "#3b82f6" }}
        >
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border-2 border-slate-200 shadow-lg z-[9999] animate-pop-in">
          <div className="p-3 border-b border-slate-100">
            <p className="text-sm font-bold pixel-font text-slate-800 truncate">
              {profile?.display_name || user.email}
            </p>
            <p className="text-[10px] font-mono text-slate-400 truncate">{user.email}</p>
            {fanGroup && (
              <span
                className="inline-block mt-1 px-2 py-0.5 text-[10px] text-white font-mono"
                style={{ backgroundColor: fanGroup.color }}
              >
                {fanGroup.name} 💜
              </span>
            )}
          </div>

          <div className="p-1">
            <Link
              href={`/groups/${profile?.fan_group_id || "bts"}/house`}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm font-mono text-slate-600 hover:bg-blue-50 transition"
            >
              🏠 My House
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm font-mono text-slate-600 hover:bg-blue-50 transition"
            >
              ⚙️ Settings
            </Link>
            <button
              onClick={() => { setOpen(false); signOut() }}
              className="w-full text-left px-3 py-2 text-sm font-mono text-red-500 hover:bg-red-50 transition"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
