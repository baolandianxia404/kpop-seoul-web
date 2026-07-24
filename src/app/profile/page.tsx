"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { useLang } from "@/components/LanguageProvider"
import { createClient } from "@/lib/supabase/client"
import { groups } from "@/lib/data/groups"

export default function ProfilePage() {
  const { t } = useLang()
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [fanGroupId, setFanGroupId] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login")
    if (profile) {
      setDisplayName(profile.display_name || "")
      setFanGroupId(profile.fan_group_id || "")
    }
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
    </div>
  )
}
