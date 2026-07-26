"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"

interface PhotoItem {
  checkinId: string
  userId: string
  userName: string
  content: string
  createdAt: string
  url: string
  allPhotos: string[]
  photoIndex: number
}

export default function PhotoWall({ locationName }: { locationName: string }) {
  const { user } = useAuth()
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<PhotoItem | null>(null)

  const handleDelete = async (checkinId: string) => {
    if (!confirm("Delete this photo?")) return
    const supabase = createClient()
    await supabase.from("check_ins").delete().eq("id", checkinId)
    setPhotos((prev) => prev.filter((p) => p.checkinId !== checkinId))
    setActive(null)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const supabase = createClient()

        const { data } = await supabase
          .from("check_ins")
          .select("*")
          .eq("spot_name", locationName)
          .order("created_at", { ascending: false })
          .limit(30)

        if (!data || cancelled) { setLoading(false); return }

        const userIds = [...new Set(data.map((c: { user_id: string }) => c.user_id))]
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds)

        const profileMap = new Map(
          (profiles || []).map((p: { id: string; display_name: string }) => [p.id, p])
        )

        const allPhotos: PhotoItem[] = []
        for (const c of (data as { id: string; user_id: string; content: string; photos: string[]; created_at: string }[])) {
          if (!c.photos || c.photos.length === 0) continue
          for (let i = 0; i < c.photos.length; i++) {
            allPhotos.push({
              checkinId: c.id,
              userId: c.user_id,
              userName: profileMap.get(c.user_id)?.display_name || c.user_id.slice(0, 8),
              content: c.content,
              createdAt: c.created_at,
              url: c.photos[i],
              allPhotos: c.photos,
              photoIndex: i,
            })
          }
        }

        if (!cancelled) {
          setPhotos(allPhotos)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [locationName])

  return (
    <section className="mt-8 pt-6 border-t border-gray-200">
      <h2 className="text-base font-bold mb-4 flex items-center gap-1.5">
        <span>📸</span>
        <span className="pixel-font">到此一游</span>
        {photos.length > 0 && (
          <span className="text-xs font-mono text-slate-300 font-normal ml-1">({photos.length})</span>
        )}
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono py-4">
          <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-300 rounded-full animate-spin" />
          加载中…
        </div>
      ) : photos.length === 0 ? (
        <div className="text-xs text-slate-400 font-mono py-8 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
          <p className="text-2xl mb-2">📷</p>
          <p>还没有打卡照，快来发第一张吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((p) => (
            <button
              key={`${p.checkinId}_${p.photoIndex}`}
              className="relative aspect-square overflow-hidden cursor-pointer border border-slate-100 hover:opacity-90 transition-opacity"
              onClick={() => setActive(p)}
            >
              <img
                src={p.url}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Detail overlay */}
      {active && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl w-10 h-10 flex items-center justify-center z-10"
            onClick={() => setActive(null)}
          >
            ✕
          </button>

          <div className="w-full max-w-lg max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Photo */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <img
                src={active.url}
                alt=""
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>

            {/* Multi-photo indicator */}
            {active.allPhotos.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {active.allPhotos.map((_, i) => (
                  <button
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      i === active.photoIndex ? "bg-white" : "bg-white/30"
                    }`}
                    onClick={() => {
                      setActive({
                        ...active,
                        url: active.allPhotos[i],
                        photoIndex: i,
                      })
                    }}
                  />
                ))}
              </div>
            )}

            {/* Info bar */}
            <div className="mt-3 px-2 flex items-center gap-3 text-white/80 text-sm">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {active.userName.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-mono">{active.userName}</span>
              {active.content && (
                <span className="text-white/50 text-xs truncate flex-1">{active.content}</span>
              )}
              <span className="text-white/30 text-xs font-mono ml-auto">
                {new Date(active.createdAt).toLocaleDateString()}
              </span>
              {user && user.id === active.userId && (
                <button
                  onClick={() => handleDelete(active.checkinId)}
                  className="text-white/40 hover:text-red-400 transition text-sm"
                >
                  🗑
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
