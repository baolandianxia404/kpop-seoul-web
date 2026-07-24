"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import PhotoGrid from "@/components/house/PhotoGrid"

interface CheckInPhoto {
  checkinId: string
  userName: string
  groupId: string
  spotName: string
  content: string
  createdAt: string
  photos: string[]
}

export default function PhotoWall({ locationName }: { locationName: string }) {
  const [checkIns, setCheckIns] = useState<CheckInPhoto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("check_ins")
      .select("*")
      .ilike("spot_name", `%${locationName}%`)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error && data) {
          const userIds = [...new Set(data.map((c: { user_id: string }) => c.user_id))]
          supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", userIds)
            .then(({ data: profiles }) => {
              const profileMap = new Map(
                (profiles || []).map((p: { id: string; display_name: string }) => [p.id, p])
              )
              const result: CheckInPhoto[] = (data as {
                id: string
                user_id: string
                group_id: string
                spot_name: string
                content: string
                photos: string[]
                created_at: string
              }[])
                .filter((c) => c.photos && c.photos.length > 0)
                .map((c) => ({
                  checkinId: c.id,
                  userName: profileMap.get(c.user_id)?.display_name || c.user_id.slice(0, 8),
                  groupId: c.group_id,
                  spotName: c.spot_name,
                  content: c.content,
                  createdAt: c.created_at,
                  photos: c.photos,
                }))
              setCheckIns(result)
            })
        }
        setLoading(false)
      })
  }, [locationName])

  if (loading) return null
  if (checkIns.length === 0) return null

  return (
    <section className="mt-8 pt-6 border-t border-gray-200">
      <h2 className="text-lg font-semibold mb-3">Fan Photos</h2>
      <div className="space-y-5">
        {checkIns.map((ci) => (
          <div
            key={ci.checkinId}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/50">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                {ci.userName.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-600 font-mono">{ci.userName}</span>
              <span className="text-[10px] text-slate-300 font-mono ml-auto">
                {new Date(ci.createdAt).toLocaleDateString()}
              </span>
            </div>
            {ci.content && (
              <p className="text-xs text-slate-500 px-4 py-2 leading-relaxed">
                {ci.content}
              </p>
            )}
            <PhotoGrid photos={ci.photos} />
          </div>
        ))}
      </div>
    </section>
  )
}
