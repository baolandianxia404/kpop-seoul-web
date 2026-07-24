"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { getGroupById } from "@/lib/data/groups"
import { groups } from "@/lib/data/groups"
import type { CheckInRow } from "@/types"
import { useLang } from "@/components/LanguageProvider"
import CheckInForm from "@/components/house/CheckInForm"
import CheckInCard from "@/components/house/CheckInCard"

export default function HouseContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t } = useLang()
  const { user, profile, loading: authLoading } = useAuth()
  const [checkIns, setCheckIns] = useState<CheckInRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [fanCount, setFanCount] = useState(0)
  const supabase = createClient()

  const group = getGroupById(id)
  const isMyHouse = profile?.fan_group_id === id

  const loadCheckIns = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("check_ins")
      .select("*")
      .eq("group_id", id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (data) {
      const userIds = [...new Set(data.map((c: CheckInRow) => c.user_id))]
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds)

      const profileMap = new Map(profiles?.map((p: CheckInRow["profile"]) => [p!.id, p]) || [])
      setCheckIns(data.map((c: CheckInRow) => ({ ...c, profile: profileMap.get(c.user_id) })))
    }
    setLoading(false)
  }

  useEffect(() => {
    if (authLoading) return
    loadCheckIns()

    // Fetch fan count
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("fan_group_id", id)
      .then(({ count }) => setFanCount(count || 0))
  }, [authLoading, id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!group) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🏠</p>
        <p className="font-mono text-slate-400">{t("common_not_found")}</p>
        <Link href="/groups" className="mt-4 inline-block pixel-btn px-4 py-2 text-xs bg-white text-slate-600">
          {t("common_back_groups")}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div
        className="relative overflow-hidden mb-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${group.color}, ${group.color}cc)`,
          border: "3px solid #1e293b",
          boxShadow: "4px 4px 0 0 rgba(0,0,0,0.2)",
        }}
      >
        {/* Decorative dots */}
        <div className="absolute top-2 right-3 flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🏠</span>
                <h1 className="text-2xl font-bold pixel-font">{group.name} {t("house_title")}</h1>
              </div>
              <div className="flex items-center gap-3 text-white/70 text-xs font-mono">
                <span>{group.fandomName}</span>
                {fanCount > 0 && (
                  <>
                    <span className="text-white/30">·</span>
                    <span>{fanCount} fans</span>
                  </>
                )}
                {isMyHouse && (
                  <>
                    <span className="text-white/30">·</span>
                    <span className="text-white/90">⭐ {t("house_my_fandom")}</span>
                  </>
                )}
              </div>
            </div>
            <Link
              href={`/groups/${id}`}
              className="pixel-btn px-3 py-1.5 text-xs bg-white/20 text-white border-white/30 hover:bg-white/30 transition"
            >
              {t("common_back_spots")}
            </Link>
          </div>
        </div>
      </div>

      {/* Auth check */}
      {authLoading ? (
        <p className="text-center font-mono text-slate-400 py-8">{t("common_loading")}</p>
      ) : !user ? (
        <div className="text-center p-8 bg-blue-50 border-2 border-dashed border-blue-200 mb-6">
          <p className="text-4xl mb-3">🏠</p>
          <p className="font-bold pixel-font text-slate-700 mb-2">🔒 {t("house_locked_title")}</p>
          <p className="text-xs text-slate-400 font-mono mb-4">
            {t("house_locked_msg").replace("{groupName}", group.name)}
          </p>
          <Link href="/auth/register" className="pixel-btn px-5 py-2.5 bg-blue-500 text-white text-xs inline-block">
            {t("house_join_fandom")}
          </Link>
          <span className="mx-2 text-xs font-mono text-slate-400">{t("common_or")}</span>
          <Link href="/auth/login" className="text-xs font-mono text-blue-500 underline">
            {t("auth_login_link")}
          </Link>
        </div>
      ) : !isMyHouse ? (
        <div className="text-center p-8 bg-amber-50 border-2 border-dashed border-amber-200 mb-6">
          <p className="text-4xl mb-3">🏠</p>
          <p className="font-bold pixel-font text-slate-700 mb-2">{t("house_not_yours")}</p>
          <p className="text-xs text-slate-400 font-mono mb-4">
            {t("house_not_yours_msg")
              .replace("{myGroup}", groups.find((g) => g.id === profile?.fan_group_id)?.name || "?")
              .replace("{houseGroup}", group.name)}
          </p>
          <Link
            href={`/groups/${profile?.fan_group_id || "bts"}/house`}
            className="pixel-btn px-5 py-2.5 text-white text-xs inline-block"
            style={{ backgroundColor: groups.find((g) => g.id === profile?.fan_group_id)?.color || "#3b82f6" }}
          >
            {t("house_go_mine")}
          </Link>
        </div>
      ) : (
        <>
          {/* Post bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-400">
                {t("house_checkin_count").replace("{n}", String(checkIns.length))}
              </span>
              {fanCount > 0 && (
                <span className="text-[10px] font-mono text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">
                  {fanCount} fans
                </span>
              )}
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="pixel-btn px-4 py-2 bg-blue-500 text-white text-xs hover:bg-blue-600 transition"
            >
              {showForm ? "✕ " + t("common_cancel") : t("house_new_checkin")}
            </button>
          </div>

          {showForm && (
            <div className="mb-6">
              <CheckInForm
                groupId={id}
                onSuccess={() => {
                  setShowForm(false)
                  loadCheckIns()
                }}
              />
            </div>
          )}

          {/* Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 animate-pulse" style={{
                  border: "2px solid #e2e8f0",
                  boxShadow: "3px 3px 0 0 rgba(0,0,0,0.03)",
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                      <div className="h-2 w-12 bg-slate-50 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-32 bg-slate-100 rounded" />
                    <div className="h-10 bg-slate-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : checkIns.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-bounce-gentle">📭</div>
              <p className="font-bold text-lg pixel-font text-slate-700 mb-2">{t("house_empty")}</p>
              <p className="text-sm text-slate-400 font-mono mb-6">
                {t("house_empty_msg")}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="pixel-btn px-6 py-3 bg-blue-500 text-white text-sm font-bold inline-block hover:bg-blue-600 transition"
              >
                ✨ {t("house_new_checkin")}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {checkIns.map((ci) => (
                <CheckInCard key={ci.id} checkIn={ci} onDelete={loadCheckIns} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
