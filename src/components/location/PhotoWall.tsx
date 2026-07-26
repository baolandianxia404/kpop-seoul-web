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
  likeCount: number
  commentCount: number
}

export default function PhotoWall({ locationName, refreshKey }: { locationName: string; refreshKey?: number }) {
  const [checkIns, setCheckIns] = useState<CheckInPhoto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("check_ins")
          .select("*")
          .ilike("spot_name", `%${locationName}%`)
          .order("created_at", { ascending: false })
          .limit(20)

        if (error || !data || cancelled) { setLoading(false); return }

        const userIds = [...new Set(data.map((c: { user_id: string }) => c.user_id))]
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds)

        const profileMap = new Map(
          (profiles || []).map((p: { id: string; display_name: string }) => [p.id, p])
        )

        const result: CheckInPhoto[] = (data as {
          id: string; user_id: string; group_id: string
          spot_name: string; content: string; photos: string[]; created_at: string
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
            likeCount: 0,
            commentCount: 0,
          }))

        if (cancelled) { setLoading(false); return }

        // Batch-fetch like/comment counts (tolerate missing tables)
        const ids = result.map((r) => r.checkinId)
        if (ids.length > 0) {
          try {
            const [{ data: likesData }, { data: commentsData }] = await Promise.all([
              supabase.from("checkin_likes").select("checkin_id").in("checkin_id", ids),
              supabase.from("checkin_comments").select("checkin_id").in("checkin_id", ids),
            ])
            const likeMap = new Map<string, number>()
            const commentMap = new Map<string, number>()
            ;(likesData || []).forEach((l: { checkin_id: string }) => {
              likeMap.set(l.checkin_id, (likeMap.get(l.checkin_id) || 0) + 1)
            })
            ;(commentsData || []).forEach((c: { checkin_id: string }) => {
              commentMap.set(c.checkin_id, (commentMap.get(c.checkin_id) || 0) + 1)
            })
            result.forEach((r) => {
              r.likeCount = likeMap.get(r.checkinId) || 0
              r.commentCount = commentMap.get(r.checkinId) || 0
            })
          } catch { /* tables not created yet — show without counts */ }
        }

        if (!cancelled) {
          setCheckIns(result)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [locationName, refreshKey])

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
            <div className="flex items-center gap-4 px-4 py-2.5 text-xs text-slate-400">
              {(ci.likeCount > 0 || ci.commentCount > 0) && (
                <>
                  {ci.likeCount > 0 && <span>❤️ {ci.likeCount}</span>}
                  {ci.commentCount > 0 && <span>💬 {ci.commentCount}</span>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
