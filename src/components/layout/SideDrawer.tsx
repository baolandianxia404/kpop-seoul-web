"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"
import { useLang } from "@/components/LanguageProvider"

export default function SideDrawer() {
  const [open, setOpen] = useState(false)
  const { user, profile } = useAuth()
  const { t, lang } = useLang()

  const houseHref = profile?.fan_group_id ? `/groups/${profile.fan_group_id}/house` : "/auth/login"

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [open])

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
        className={`fixed top-0 bottom-0 right-0 w-56 bg-white/98 backdrop-blur-xl shadow-2xl z-50 transition-transform duration-300 ease-out rounded-l-2xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer handle area */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-slate-100">
          <span className="text-sm font-bold text-slate-700">
            {lang === "zh" ? "菜单" : "Menu"}
          </span>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Menu items */}
        <div className="p-3 flex flex-col gap-1">
          {user && (
            <DrawerItem
              href={houseHref}
              icon="🏠"
              label={t("nav_house")}
              onClick={() => setOpen(false)}
            />
          )}
          <DrawerItem
            href="/saved"
            icon="⭐"
            label={t("nav_saved")}
            onClick={() => setOpen(false)}
          />
          <DrawerItem
            href="/planner"
            icon="📝"
            label={t("header_add_spot")}
            onClick={() => setOpen(false)}
          />
          <DrawerItem
            href="/plan"
            icon="🗺️"
            label={t("nav_plan")}
            onClick={() => setOpen(false)}
          />
          {!user && (
            <DrawerItem
              href="/auth/register"
              icon="🌟"
              label={t("header_join")}
              onClick={() => setOpen(false)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-[10px] text-slate-300 font-mono">🐰 StarTrail</p>
        </div>
      </div>

      {/* Handle tab — always visible on right edge */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 w-7 h-16 bg-white/90 backdrop-blur rounded-l-xl shadow-lg border border-r-0 border-slate-200 flex items-center justify-center transition-all duration-300 hover:w-8 hover:bg-blue-50 ${
          open ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        <span className="text-slate-400 text-xs leading-tight text-center">
          ✦
        </span>
      </button>
    </div>
  )
}

function DrawerItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-500 transition-all duration-200 group"
    >
      <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  )
}
