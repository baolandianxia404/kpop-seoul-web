"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "./AuthProvider"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error: err } = await signIn(email, password)
    if (err) setError(err)
    else router.push("/")
    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <p className="text-4xl mb-2">🏠</p>
        <h1 className="text-2xl font-bold pixel-font text-slate-800">WELCOME BACK</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">Sign in to your idol house</p>
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
          <label className="text-sm font-bold pixel-font text-slate-700 block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-3 py-2.5 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none bg-white font-mono"
          />
        </div>

        {error && (
          <p className="text-xs font-mono text-red-500 bg-red-50 p-2 border border-red-200">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 btn-cute text-white font-bold rounded-xl disabled:opacity-40 text-sm"
        >
          {loading ? "Signing in..." : "SIGN IN"}
        </button>

        <p className="text-xs font-mono text-slate-400 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-blue-500 underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}
