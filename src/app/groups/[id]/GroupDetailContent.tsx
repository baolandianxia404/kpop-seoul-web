"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import type { Group, Location, LocationType, CommunitySpotRow } from "@/types"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"
import Link from "next/link"
import PhotoUploader from "@/components/location/PhotoUploader"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"

const PIXEL_ICONS: Record<string, string> = {
  company: "▣", restaurant: "◆", mv_spot: "▶", store: "◉", entertainment: "★",
}

interface Props {
  group: Group | undefined
  relatedLocations: Location[]
}

export default function GroupDetailContent({ group, relatedLocations }: Props) {
  const { user } = useAuth()
  const [communitySpots, setCommunitySpots] = useState<CommunitySpotRow[]>([])
  const [editingSpot, setEditingSpot] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editAddr, setEditAddr] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    loadSpots()
  }, [group])

  const loadSpots = async () => {
    if (!group) return
    const supabase = createClient()

    // Load from Supabase
    const { data } = await supabase
      .from("community_spots")
      .select("*")
      .contains("group_ids", [group.id])
      .order("created_at", { ascending: false })

    if (data && data.length > 0) {
      setCommunitySpots(data as CommunitySpotRow[])
    } else {
      // Fallback to localStorage
      try {
        const all = JSON.parse(localStorage.getItem("kpop_community_spots") || "[]")
        const filtered = all.filter((s: { groupNames: string[] }) => s.groupNames?.includes(group.id))
        if (filtered.length > 0) {
          setCommunitySpots(filtered.map((s: Record<string, unknown>) => ({
            id: s.id as string,
            location_name: (s.locationName || "") as string,
            address: (s.address || "") as string,
            type: (s.type || "restaurant") as LocationType,
            group_ids: (s.groupNames || []) as string[],
            xhs_link: (s.xhsLink || "") as string,
            description: (s.description || "") as string,
            submitted_by: null,
            status: ((s.locationName && s.address) ? "complete" : "draft") as "draft" | "complete",
            created_at: (s.submittedAt || new Date().toISOString()) as string,
          })))
        }
      } catch {}
    }
  }

  const handleCompleteSpot = (spot: CommunitySpotRow) => {
    setEditingSpot(spot.id)
    setEditName(spot.location_name)
    setEditAddr(spot.address)
  }

  const saveCompleteSpot = async (spotId: string) => {
    if (!user) return
    setSavingEdit(true)
    const supabase = createClient()
    await supabase.from("community_spots").update({
      location_name: editName,
      address: editAddr,
      status: editName && editAddr ? "complete" : "draft",
    }).eq("id", spotId)
    setEditingSpot(null)
    setSavingEdit(false)
    loadSpots()
  }

  if (!group) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <nav className="text-sm font-mono text-slate-400 mb-4">
        <Link href="/" className="hover:text-blue-500">HOME</Link>
        <span className="mx-2">/</span>
        <Link href="/groups" className="hover:text-blue-500">GROUPS</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">{group.name}</span>
      </nav>

      {/* Header */}
      <div
        className="p-6 mb-4 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${group.color}, ${group.color}dd)`,
          border: "3px solid #1e293b",
          boxShadow: "4px 4px 0 0 rgba(0,0,0,0.2)",
        }}
      >
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="w-2 h-2 bg-white/60" /><div className="w-2 h-2 bg-white/40" /><div className="w-2 h-2 bg-white/60" />
        </div>

        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 flex items-center justify-center text-2xl font-bold font-mono"
            style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", imageRendering: "pixelated" }}
          >
            {group.name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold pixel-font">{group.name}</h1>
            <p className="text-white/80 text-sm font-mono">{group.nameKo}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="pixel-tag bg-white/20 text-white border-white/30 text-[10px]">
                {group.type === "boy_group" ? "BOY" : group.type === "girl_group" ? "GIRL" : group.type === "band" ? "BAND" : "SOLO"}
              </span>
              <span className="pixel-tag bg-white/20 text-white border-white/30 text-[10px]">{group.company}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 text-center" style={{ borderTop: "2px dashed rgba(255,255,255,0.3)" }}>
          <div><p className="text-2xl font-bold font-mono">{group.debutYear}</p><p className="text-xs font-mono text-white/70">DEBUT</p></div>
          <div><p className="text-2xl font-bold font-mono">{group.memberCount}</p><p className="text-xs font-mono text-white/70">MEMBERS</p></div>
          <div><p className="text-2xl font-bold font-mono">{group.fandomName}</p><p className="text-xs font-mono text-white/70">FANDOM</p></div>
        </div>

        {/* House CTA */}
        <div className="mt-4 pt-4 text-center" style={{ borderTop: "2px dashed rgba(255,255,255,0.3)" }}>
          <Link
            href={`/groups/${group.id}/house`}
            className="inline-block pixel-btn px-5 py-2 text-sm bg-white/20 text-white border-white/40 hover:bg-white/30"
          >
            🏠 ENTER {group.name} HOUSE
          </Link>
        </div>
      </div>

      {/* Related Locations */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold pixel-font text-slate-800">{relatedLocations.length} SPOTS</h2>
        <span className="text-xs font-mono text-slate-400">click card for details · upload your photos 📷</span>
      </div>

      {relatedLocations.length > 0 ? (
        <div className="space-y-4">
          {relatedLocations.map((loc) => {
            const typeInfo = LOCATION_TYPES[loc.type]
            const pixelIcon = PIXEL_ICONS[loc.type] || "●"
            return (
              <div key={loc.id} className="pixel-card p-4 bg-white animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/locations/${loc.id}`} className="group inline-block">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-8 h-8 flex items-center justify-center text-sm text-white font-mono font-bold flex-shrink-0"
                          style={{ backgroundColor: typeInfo.color, border: "2px solid #1e293b" }}>
                          {pixelIcon}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm text-slate-800 pixel-font group-hover:text-blue-600 transition-colors">{loc.name}</h3>
                          <p className="text-xs text-slate-400">{loc.nameKo}</p>
                        </div>
                        {loc.rating && <span className="ml-auto text-amber-400 text-sm font-mono font-bold">★ {loc.rating}</span>}
                      </div>
                    </Link>
                    <div className="flex flex-wrap gap-1 mb-2 ml-10">
                      <span className="pixel-tag text-white text-[10px]" style={{ backgroundColor: typeInfo.color }}>{TYPE_NAME_CN[loc.type]}</span>
                      <span className="text-[10px] font-mono text-slate-400">📍 {loc.location.district} · {loc.location.neighborhood}</span>
                      <span className="text-[10px] font-mono text-slate-400">{loc.price.isFree ? "FREE" : loc.price.range}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 ml-10 font-mono">{loc.description}</p>
                  </div>
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <Link href={`/locations/${loc.id}`} className="pixel-btn px-3 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 text-center whitespace-nowrap">DETAILS ▶</Link>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${loc.location.latitude},${loc.location.longitude}`}
                      target="_blank" rel="noopener noreferrer"
                      className="pixel-btn px-3 py-1.5 text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 text-center whitespace-nowrap">MAP ▶</a>
                  </div>
                </div>
                <div className="ml-10"><PhotoUploader locationId={loc.id} locationName={loc.name} /></div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-mono text-slate-400">No locations found for {group.name} yet.</p>
        </div>
      )}

      {/* Community Spots */}
      {communitySpots.length > 0 && (
        <section className="mt-8 pt-6" style={{ borderTop: "2px dashed #cbd5e1" }}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold pixel-font text-slate-800">📌 COMMUNITY SPOTS</h2>
            <span className="text-xs font-mono text-amber-500">({communitySpots.length} contributed)</span>
          </div>
          <div className="space-y-3">
            {communitySpots.map((spot) => {
              const typeInfo = LOCATION_TYPES[spot.type as keyof typeof LOCATION_TYPES] || LOCATION_TYPES.restaurant
              const isDraft = spot.status === "draft"
              const editing = editingSpot === spot.id

              return (
                <div
                  key={spot.id}
                  className={`p-4 animate-slide-up ${isDraft ? "bg-amber-50/70" : "bg-amber-50"}`}
                  style={{
                    border: isDraft ? "2px dashed #f59e0b" : "2px dashed #fbbf24",
                    boxShadow: "3px 3px 0 0 rgba(245, 158, 11, 0.1)",
                  }}
                >
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Location name"
                        className="w-full px-3 py-1.5 text-sm border-2 border-blue-300 outline-none font-mono"
                      />
                      <input
                        value={editAddr}
                        onChange={(e) => setEditAddr(e.target.value)}
                        placeholder="Address"
                        className="w-full px-3 py-1.5 text-sm border-2 border-blue-300 outline-none font-mono"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveCompleteSpot(spot.id)}
                          disabled={savingEdit}
                          className="pixel-btn px-3 py-1 text-xs bg-blue-500 text-white"
                        >
                          {savingEdit ? "..." : "SAVE"}
                        </button>
                        <button
                          onClick={() => setEditingSpot(null)}
                          className="pixel-btn px-3 py-1 text-xs bg-white text-slate-500"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2 mb-2">
                        <span className="w-7 h-7 flex items-center justify-center text-xs text-white font-mono font-bold flex-shrink-0"
                          style={{ backgroundColor: typeInfo.color, border: "2px solid #1e293b" }}>
                          {PIXEL_ICONS[spot.type] || "●"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-slate-800 pixel-font">
                            {spot.location_name || <span className="text-amber-400 italic">Unnamed Spot</span>}
                            {isDraft && (
                              <span className="ml-2 text-[10px] font-mono text-amber-600 bg-amber-200 px-1.5 py-0.5">
                                NEEDS INFO
                              </span>
                            )}
                          </h3>
                          {spot.address && (
                            <p className="text-xs text-slate-400 font-mono mt-0.5">📍 {spot.address}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-300 flex-shrink-0">
                          {new Date(spot.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2 ml-9">
                        <span className="pixel-tag text-white text-[10px]" style={{ backgroundColor: typeInfo.color }}>
                          {TYPE_NAME_CN[spot.type as keyof typeof TYPE_NAME_CN] || "Restaurant"}
                        </span>
                        {spot.description && <p className="text-xs text-slate-500 font-mono">{spot.description}</p>}
                      </div>

                      {spot.xhs_link && (
                        <div className="ml-9">
                          <a href={spot.xhs_link} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] font-mono text-red-400 hover:text-red-500 underline">
                            📱 Source: Xiaohongshu
                          </a>
                        </div>
                      )}

                      {isDraft && user && (
                        <div className="ml-9 mt-2">
                          <button
                            onClick={() => handleCompleteSpot(spot)}
                            className="text-[10px] font-mono text-amber-600 underline hover:text-amber-700"
                          >
                            ✏️ Help complete this spot
                          </button>
                        </div>
                      )}

                      <div className="ml-9 mt-2">
                        <PhotoUploader locationId={spot.id} locationName={spot.location_name || "Community Spot"} />
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Add spot CTA */}
      <div className="mt-8 text-center p-6 bg-blue-50 border-2 border-dashed border-blue-200">
        <p className="font-bold pixel-font text-slate-700 mb-2">💡 Know a spot we&apos;re missing?</p>
        <p className="text-xs text-slate-400 font-mono mb-3">Share your idol&apos;s favorite places — just pick a group!</p>
        <Link href="/planner" className="pixel-btn px-6 py-2 bg-blue-500 text-white text-sm inline-block">
          📌 ADD A SPOT
        </Link>
      </div>
    </div>
  )
}
