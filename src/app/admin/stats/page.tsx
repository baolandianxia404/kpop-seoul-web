"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClient } from "@/lib/supabase/client"

const ADMIN_EMAIL = "1793879075@qq.com"

interface Stats {
  onlineNow: number
  registeredUsers: number
  totalCheckins: number
  withPhotos: number
  houseCheckins: number
  locationCheckins: number
  recentUsers: { display_name: string; email: string; created_at: string }[]
  topSpots: { spot_name: string; count: number }[]
  totalViews: number
  todayViews: number
  topPages: { path: string; count: number }[]
}

export default function AdminStatsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push("/")
      return
    }
    loadStats()
  }, [user, authLoading])

  const loadStats = async () => {
    const supabase = createClient()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString()

    const [
      { count: onlineNow = 0 },
      { count: registeredUsers },
      { count: totalCheckins },
      { count: withPhotos },
      { count: houseCheckins },
      { count: locationCheckins },
      { data: recentUsers },
      { data: topSpots },
      { count: totalViews },
      { count: todayViews },
      { data: pageData },
    ] = await Promise.all([
      supabase.from("user_presence").select("*", { count: "exact", head: true }).gte("last_seen", fiveMinAgo).order("last_seen", { ascending: false }).then(({ count }) => ({ count: count ?? 0 })),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("check_ins").select("*", { count: "exact", head: true }),
      supabase.from("check_ins").select("*", { count: "exact", head: true }).not("photos", "is", null),
      supabase.from("check_ins").select("*", { count: "exact", head: true }).not("group_id", "is", null),
      supabase.from("check_ins").select("*", { count: "exact", head: true }).is("group_id", null),
      supabase.from("profiles").select("display_name, email, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("check_ins").select("spot_name").not("group_id", "is", null).then(({ data }) => {
        const counter: Record<string, number> = {}
        for (const r of (data || []) as { spot_name: string }[]) {
          counter[r.spot_name] = (counter[r.spot_name] || 0) + 1
        }
        return { data: Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([spot_name, count]) => ({ spot_name, count })) }
      }),
      supabase.from("page_views").select("*", { count: "exact", head: true }),
      supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
      supabase.from("page_views").select("path"),
    ])

    const topPages = (() => {
      const counter: Record<string, number> = {}
      for (const r of (pageData || []) as { path: string }[]) {
        const name = r.path === "/" ? "🏠 Home" : r.path
        counter[name] = (counter[name] || 0) + 1
      }
      return Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count]) => ({ path, count }))
    })()

    setStats({
      onlineNow: onlineNow || 0,
      registeredUsers: registeredUsers || 0,
      totalCheckins: totalCheckins || 0,
      withPhotos: withPhotos || 0,
      houseCheckins: houseCheckins || 0,
      locationCheckins: locationCheckins || 0,
      recentUsers: (recentUsers || []) as Stats["recentUsers"],
      topSpots: (topSpots || []) as Stats["topSpots"],
      totalViews: totalViews || 0,
      todayViews: todayViews || 0,
      topPages,
    })
    setLoading(false)
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-gray-400">Loading...</p></div>
  }

  if (!user || user.email !== ADMIN_EMAIL) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-black text-slate-700 mb-6">📊 数据统计</h1>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="p-4 bg-white rounded-xl border border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <p className="text-2xl font-black text-green-500">{stats!.onlineNow}</p>
          <p className="text-xs text-gray-400">当前在线</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100">
          <p className="text-2xl font-black text-blue-500">{stats!.registeredUsers}</p>
          <p className="text-xs text-gray-400">注册用户</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <p className="text-2xl font-black text-pink-500">{stats!.totalViews.toLocaleString()}</p>
          <p className="text-xs text-gray-400">总访问量</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100 bg-gradient-to-br from-sky-50 to-blue-50">
          <p className="text-2xl font-black text-sky-500">{stats!.todayViews.toLocaleString()}</p>
          <p className="text-xs text-gray-400">今日访问</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100">
          <p className="text-2xl font-black text-amber-500">{stats!.totalCheckins}</p>
          <p className="text-xs text-gray-400">总发帖</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100">
          <p className="text-2xl font-black text-emerald-500">{stats!.withPhotos}</p>
          <p className="text-xs text-gray-400">带照片帖</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100">
          <p className="text-2xl font-black text-purple-500">{stats!.houseCheckins}</p>
          <p className="text-xs text-gray-400">小屋打卡</p>
        </div>
      </div>

      {stats!.topPages.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-sm text-slate-600 mb-3">📄 热门页面</h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y">
            {stats!.topPages.map((p) => (
              <div key={p.path} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-slate-600 truncate">{p.path}</span>
                <span className="text-xs font-mono text-slate-400 ml-2">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats!.topSpots.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-sm text-slate-600 mb-3">🔥 热门打卡点</h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y">
            {stats!.topSpots.slice(0, 10).map((s, i) => (
              <div key={s.spot_name} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-slate-600">
                  <span className="text-xs text-gray-400 mr-2">{i + 1}</span>
                  {s.spot_name}
                </span>
                <span className="text-xs font-mono text-slate-400">{s.count} 帖</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats!.recentUsers.length > 0 && (
        <div>
          <h2 className="font-semibold text-sm text-slate-600 mb-3">👥 最近注册</h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y">
            {stats!.recentUsers.map((u) => (
              <div key={u.email} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-slate-600">{u.display_name || u.email.split("@")[0]}</span>
                <span className="text-xs text-gray-400">
                  {new Date(u.created_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
