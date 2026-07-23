"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "./AuthProvider"
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
        <h1 className="text-xl font-bold pixel-font text-slate-800 mb-2">WELCOME TO THE FANDOM!</h1>
        <p className="text-sm text-slate-400 font-mono">Check your email to confirm, or start exploring now.</p>
      </div>
    )
  }

  const sortedGroups = [...groups].sort((a, b) => b.popularity - a.popularity)

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <p className="text-4xl mb-2">🏠</p>
        <h1 className="text-2xl font-bold pixel-font text-slate-800">JOIN THE FANDOM</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">Create your idol house account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="fan@kpop.com"
            className="w-full px-3 py-2.5 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
          />
        </div>

        <div>
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">Password (6+ chars)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-3 py-2.5 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
          />
        </div>

        <div>
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-3 py-2.5 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
          />
        </div>

        <div>
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">Your Fan Group *</label>
          <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-2 border-2 border-slate-200 bg-white">
            {sortedGroups.map((g) => (
              <button
                key={g.id}
                type="button"
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
          {fanGroupId && (
            <p className="text-xs font-mono text-slate-400 mt-1">
              Selected: {groups.find((g) => g.id === fanGroupId)?.name}
            </p>
          )}
        </div>

        {error && (
          <p className="text-xs font-mono text-red-500 bg-red-50 p-2 border border-red-200">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 btn-cute text-white font-bold rounded-xl disabled:opacity-40 text-sm"
        >
          {loading ? "Creating..." : "CREATE ACCOUNT"}
        </button>

        <p className="text-xs font-mono text-slate-400 text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-500 underline">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
