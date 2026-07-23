"use client"

import { useState, useEffect, use, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { getGroupById } from "@/lib/data/groups"
import { groups } from "@/lib/data/groups"
import type { CheckInRow } from "@/types"
import CheckInForm from "@/components/house/CheckInForm"
import CheckInCard from "@/components/house/CheckInCard"

export default function HouseContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, profile, loading: authLoading } = useAuth()
  const [checkIns, setCheckIns] = useState<CheckInRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const group = getGroupById(id)
  const isMyHouse = profile?.fan_group_id === id

  const loadCheckIns = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("check_ins")
      .select("*")
      .eq("group_id", id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (data) {
      // Fetch profiles for each check-in
      const userIds = [...new Set(data.map((c: CheckInRow) => c.user_id))]
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds)

      const profileMap = new Map(profiles?.map((p: CheckInRow["profile"]) => [p!.id, p]) || [])
      setCheckIns(data.map((c: CheckInRow) => ({ ...c, profile: profileMap.get(c.user_id) })))
    }
    setLoading(false)
  }, [supabase, id])

  useEffect(() => {
    if (!authLoading) loadCheckIns()
  }, [authLoading, loadCheckIns])

  if (!group) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🏠</p>
        <p className="font-mono text-slate-400">House not found.</p>
        <Link href="/groups" className="mt-4 inline-block pixel-btn px-4 py-2 text-xs bg-white text-slate-600">
          ← BACK TO GROUPS
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div
        className="p-5 mb-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${group.color}, ${group.color}dd)`,
          border: "3px solid #1e293b",
          boxShadow: "4px 4px 0 0 rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🏠</span>
              <h1 className="text-2xl font-bold pixel-font">{group.name} House</h1>
            </div>
            <p className="text-white/70 text-xs font-mono">
              {group.fandomName} gathering place
            </p>
          </div>
          <Link
            href={`/groups/${id}`}
            className="pixel-btn px-3 py-1.5 text-xs bg-white/20 text-white border-white/30"
          >
            ← SPOTS
          </Link>
        </div>
      </div>

      {/* Auth check */}
      {authLoading ? (
        <p className="text-center font-mono text-slate-400 py-8">Loading...</p>
      ) : !user ? (
        <div className="text-center p-6 bg-blue-50 border-2 border-dashed border-blue-200 mb-6">
          <p className="font-bold pixel-font text-slate-700 mb-2">🔒 Fandom Members Only</p>
          <p className="text-xs text-slate-400 font-mono mb-3">
            Sign in and join {group.name}&apos;s fandom to see check-ins.
          </p>
          <Link href="/auth/register" className="pixel-btn px-4 py-2 bg-blue-500 text-white text-xs inline-block">
            JOIN FANDOM
          </Link>
          <span className="mx-2 text-xs font-mono text-slate-400">or</span>
          <Link href="/auth/login" className="text-xs font-mono text-blue-500 underline">
            Sign In
          </Link>
        </div>
      ) : !isMyHouse ? (
        <div className="text-center p-6 bg-amber-50 border-2 border-dashed border-amber-200 mb-6">
          <p className="font-bold pixel-font text-slate-700 mb-2">🏠 This is {group.name}&apos;s House</p>
          <p className="text-xs text-slate-400 font-mono mb-3">
            You&apos;re a {groups.find((g) => g.id === profile?.fan_group_id)?.name || "?"} fan.
            Only {group.name} fandom members can view posts here.
          </p>
          <Link
            href={`/groups/${profile?.fan_group_id || "bts"}/house`}
            className="pixel-btn px-4 py-2 bg-amber-400 text-white text-xs inline-block"
          >
            GO TO MY HOUSE →
          </Link>
        </div>
      ) : (
        <>
          {/* Post button */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-mono text-slate-400">
              {checkIns.length} check-ins
            </span>
            <button
              onClick={() => setShowForm(!showForm)}
              className="pixel-btn px-4 py-2 bg-blue-500 text-white text-xs"
            >
              {showForm ? "✕ CANCEL" : "📝 NEW CHECK-IN"}
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
            <p className="text-center font-mono text-slate-400 py-8 animate-pulse">
              Loading check-ins...
            </p>
          ) : checkIns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">📭</p>
              <p className="font-bold pixel-font text-slate-700 mb-1">No check-ins yet!</p>
              <p className="text-xs text-slate-400 font-mono">
                Be the first to share your pilgrimage story.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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
