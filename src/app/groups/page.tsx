"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { groups } from "@/lib/data/groups"
import { useLang } from "@/components/LanguageProvider"
import type { Group } from "@/types"

type Category = "all" | "boy_group" | "girl_group" | "solo" | "band"

const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
  { key: "all", label: "ALL", icon: "💙", color: "#3b82f6" },
  { key: "boy_group", label: "BOY", icon: "💿", color: "#6366f1" },
  { key: "girl_group", label: "GIRL", icon: "🎀", color: "#ec4899" },
  { key: "solo", label: "SOLO", icon: "🎤", color: "#f59e0b" },
  { key: "band", label: "BAND", icon: "🎸", color: "#10b981" },
]

export default function GroupsPage() {
  const { t } = useLang()
  const [category, setCategory] = useState<Category>("all")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    let result = [...groups].sort((a, b) => b.popularity - a.popularity)
    if (category !== "all") result = result.filter((g) => g.type === category)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.nameKo.includes(q) ||
          g.fandomName?.toLowerCase().includes(q) ||
          g.company?.toLowerCase().includes(q)
      )
    }
    return result
  }, [category, search])

  const top5Ids = new Set(groups.sort((a, b) => b.popularity - a.popularity).slice(0, 5).map((g) => g.id))

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-[#f0f4ff] via-white to-[#fffdf0]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl animate-bounce-gentle">💙</span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              <span className="text-blue-500">Kpop</span>{" "}
              <span className="text-amber-500">Groups</span>
            </h1>
            <span className="text-3xl animate-bounce-gentle" style={{ animationDelay: "0.5s" }}>✨</span>
          </div>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            {groups.length} groups · pick your fandom and explore their Seoul spots
          </p>
        </div>

        {/* Search */}
        <div className="mb-4 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search group or fandom..."
              className="w-full px-4 py-2.5 text-sm font-mono bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-300 text-slate-700 placeholder:text-slate-300 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 font-mono text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {CATEGORIES.map(({ key, label, icon, color }) => {
            const count = key === "all" ? groups.length : groups.filter((g) => g.type === key).length
            const active = category === key
            return (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold font-mono rounded-full transition-all duration-200"
                style={{
                  backgroundColor: active ? color : "transparent",
                  color: active ? "#fff" : "#94a3b8",
                  border: active ? "2px solid transparent" : "2px solid #e2e8f0",
                  transform: active ? "scale(1.05)" : "scale(1)",
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
                <span className="opacity-60">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Groups Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((group, i) => (
              <GroupCard
                key={group.id}
                group={group}
                index={i}
                isTop={top5Ids.has(group.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🔍</p>
            <p className="font-mono text-slate-400">No groups found</p>
            <button
              onClick={() => { setCategory("all"); setSearch("") }}
              className="mt-3 text-xs font-mono text-blue-500 underline"
            >
              Reset filters
            </button>
          </div>
        )}

        <div className="text-center mt-10 pb-4">
          <p className="text-xs text-gray-300 font-mono">
            💙 Pick a group to explore their Seoul spots → Enter the fan House
          </p>
        </div>
      </div>
    </div>
  )
}

function GroupCard({ group, index, isTop }: { group: Group; index: number; isTop: boolean }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="group block"
    >
      <div
        className="relative p-3 rounded-2xl bg-white border-2 border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden animate-slide-up"
        style={{
          animationDelay: `${index * 40}ms`,
          animationFillMode: "both",
        }}
      >
        {/* Top color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: group.color }}
        />

        {/* Star badge for top groups */}
        {isTop && (
          <div className="absolute -top-0.5 -right-0.5 z-10">
            <span className="text-[10px]">⭐</span>
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white shadow-sm group-hover:scale-110 transition-transform duration-300"
            style={{
              backgroundColor: group.color,
              boxShadow: `0 0 12px ${group.color}40`,
            }}
          >
            {group.name[0]}
          </div>

          {/* Name */}
          <div className="text-center min-w-0">
            <h3 className="font-bold text-xs text-slate-700 group-hover:text-blue-500 transition-colors truncate">
              {group.name}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {group.fandomName || group.nameKo}
            </p>
          </div>

          {/* Type tag */}
          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold"
            style={{
              backgroundColor: `${group.color}15`,
              color: group.color,
            }}
          >
            {group.type === "boy_group" ? "BOY" : group.type === "girl_group" ? "GIRL" : group.type === "band" ? "BAND" : "SOLO"}
          </span>
        </div>
      </div>
    </Link>
  )
}
