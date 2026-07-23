"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "./AuthProvider"
import { useLang } from "@/components/LanguageProvider"
import { groups } from "@/lib/data/groups"

export default function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [fanGroupId, setFanGroupId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()
  const { t } = useLang()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirm) { setError("Passwords do not match."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    if (!fanGroupId) { setError("Please select your fan group."); return }

    setLoading(true)
    const { error: err } = await signUp(email, password, fanGroupId)
    if (err) { setError(err); setLoading(false) }
    else {
      setSuccess(true)
      setTimeout(() => router.push("/"), 1500)
    }
  }

  if (success) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="text-xl font-bold pixel-font text-slate-800 mb-2">
          {t("auth_register_success_title")}
        </h1>
        <p className="text-sm text-slate-400 font-mono">{t("auth_register_success")}</p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <p className="text-4xl mb-2">🏠</p>
        <h1 className="text-2xl font-bold pixel-font text-slate-800">{t("auth_register_title")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">{t("auth_email")}</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            placeholder="fan@kpop.com"
            className="w-full px-3 py-2.5 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
          />
        </div>

        <div>
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">{t("auth_password")}</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            placeholder="••••••••"
            className="w-full px-3 py-2.5 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
          />
        </div>

        <div>
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">{t("auth_confirm_password")}</label>
          <input
            type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
            placeholder="••••••••"
            className="w-full px-3 py-2.5 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
          />
        </div>

        <div>
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">{t("auth_select_group")}</label>
          <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-2 border-2 border-slate-200 bg-white">
            {[...groups].sort((a, b) => b.popularity - a.popularity).map((g) => (
              <button
                key={g.id} type="button"
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

        {error && (
          <p className="text-xs font-mono text-red-500 bg-red-50 p-2 border border-red-200">{error}</p>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full py-3 btn-cute text-white font-bold rounded-xl disabled:opacity-40 text-sm"
        >
          {loading ? "..." : t("auth_submit_register")}
        </button>

        <p className="text-xs font-mono text-slate-400 text-center">
          {t("auth_has_account")}{" "}
          <Link href="/auth/login" className="text-blue-500 underline">{t("auth_login_link")}</Link>
        </p>
      </form>
    </div>
  )
}
