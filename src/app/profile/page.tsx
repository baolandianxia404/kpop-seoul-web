"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { useLang } from "@/components/LanguageProvider"
import { createClient } from "@/lib/supabase/client"
import { groups } from "@/lib/data/groups"
import type { CheckInRow } from "@/types"

export default function ProfilePage() {
  const { t } = useLang()
  const { user, profile, loading, refreshProfile, signOut } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [fanGroupId, setFanGroupId] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [myCheckIns, setMyCheckIns] = useState<CheckInRow[]>([])
  const [checkInsLoading, setCheckInsLoading] = useState(false)

  const loadMyCheckIns = async () => {
    if (!user) return
    setCheckInsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
    if (data) setMyCheckIns(data as CheckInRow[])
    setCheckInsLoading(false)
  }

  const handleDeleteCheckIn = async (checkinId: string) => {
    if (!confirm(t("checkin_delete_confirm"))) return
    const supabase = createClient()
    await supabase.from("check_ins").delete().eq("id", checkinId)
    setMyCheckIns((prev) => prev.filter((ci) => ci.id !== checkinId))
  }

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login")
    if (profile) {
      setDisplayName(profile.display_name || "")
      setFanGroupId(profile.fan_group_id || "")
    }
    if (user) loadMyCheckIns()
  }, [user, loading, profile, router])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage("")

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, fan_group_id: fanGroupId })
      .eq("id", user.id)

    if (error) setMessage(`Error: ${error.message}`)
    else {
      setMessage(t("profile_saved"))
      refreshProfile()
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="max-w-sm mx-auto px-4 py-16 text-center font-mono text-slate-400">{t("common_loading")}</div>
  }
  if (!user) return null

  const sortedGroups = [...groups].sort((a, b) => b.popularity - a.popularity)

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <p className="text-4xl mb-2">⚙️</p>
        <h1 className="text-2xl font-bold pixel-font text-slate-800">{t("profile_title")}</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">Email</label>
          <input
            type="email"
            value={user.email || ""}
            disabled
            className="w-full px-3 py-2.5 text-sm border-2 border-slate-200 bg-slate-50 text-slate-400 font-mono cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">{t("profile_display_name")}</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your nickname"
            className="w-full px-3 py-2.5 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
          />
        </div>

        <div>
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">{t("profile_fan_group")}</label>
          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto p-2 border-2 border-slate-200 bg-white">
            {sortedGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => setFanGroupId(g.id)}
                className={`pixel-btn px-2 py-1 text-[10px] transition ${
                  fanGroupId === g.id ? "text-white border-slate-800" : "bg-white text-slate-500"
                }`}
                style={fanGroupId === g.id ? { backgroundColor: g.color, borderColor: "#1e293b" } : {}}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <p className={`text-xs font-mono p-2 border ${message.startsWith("Error") ? "text-red-500 bg-red-50 border-red-200" : "text-green-600 bg-green-50 border-green-200"}`}>
            {message}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 btn-cute text-white font-bold rounded-xl disabled:opacity-40 text-sm"
        >
          {saving ? t("profile_saving") : t("profile_save")}
        </button>
      </div>

      {/* Sign Out */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <button
          onClick={() => { if (confirm("确定退出登录？")) signOut() }}
          className="w-full py-2.5 text-sm text-slate-400 hover:text-red-500 font-mono transition"
        >
          退出登录
        </button>
      </div>

      {/* My Check-ins */}
      <div className="mt-10 pt-8 border-t-2 border-dashed border-slate-200">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">📝</span>
          <h2 className="text-lg font-bold pixel-font text-slate-800">My Check-ins</h2>
        </div>

        {checkInsLoading ? (
          <p className="text-center font-mono text-xs text-slate-400 py-6">{t("common_loading")}</p>
        ) : myCheckIns.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm text-slate-400 font-mono">No check-ins yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myCheckIns.map((ci) => (
              <div
                key={ci.id}
                className="bg-white p-4 flex items-start gap-3"
                style={{ border: "2px solid #e2e8f0", boxShadow: "2px 2px 0 0 rgba(0,0,0,0.03)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">📍</span>
                    <p className="text-sm font-bold text-slate-800 truncate">{ci.spot_name}</p>
                  </div>
                  {ci.spot_location && (
                    <p className="text-[10px] text-slate-400 ml-6 mb-1">{ci.spot_location}</p>
                  )}
                  {ci.content && (
                    <p className="text-xs text-slate-500 leading-relaxed ml-6 line-clamp-2">{ci.content}</p>
                  )}
                  <p className="text-[10px] text-slate-300 font-mono ml-6 mt-1">
                    {new Date(ci.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCheckIn(ci.id)}
                  className="text-xs text-slate-300 hover:text-red-400 transition flex-shrink-0 mt-0.5"
                  title={t("checkin_delete")}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
