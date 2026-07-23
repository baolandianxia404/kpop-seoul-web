"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import type { CheckInRow } from "@/types"
import PhotoGrid from "./PhotoGrid"

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  profile?: { display_name: string } | null
}

interface Props {
  checkIn: CheckInRow
  onDelete: () => void
}

export default function CheckInCard({ checkIn, onDelete }: Props) {
  const { user } = useAuth()
  const isOwner = user?.id === checkIn.user_id
  const profile = checkIn.profile
  const supabase = createClient()

  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Load likes
  useEffect(() => {
    supabase
      .from("checkin_likes")
      .select("*", { count: "exact", head: true })
      .eq("checkin_id", checkIn.id)
      .then(({ count }) => setLikes(count || 0))

    if (user) {
      supabase
        .from("checkin_likes")
        .select("*")
        .eq("checkin_id", checkIn.id)
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => setLiked(!!data))
    }
  }, [supabase, checkIn.id, user])

  // Load comments
  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from("checkin_comments")
      .select("*")
      .eq("checkin_id", checkIn.id)
      .order("created_at", { ascending: true })
      .limit(50)

    if (data) {
      const userIds = [...new Set(data.map((c: Comment) => c.user_id))]
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds)
      const profileMap = new Map(profiles?.map((p: { id: string; display_name: string }) => [p.id, p]) || [])
      setComments(data.map((c: Comment) => ({ ...c, profile: profileMap.get(c.user_id) || null })))
    }
  }, [supabase, checkIn.id])

  useEffect(() => {
    if (showComments) loadComments()
  }, [showComments, loadComments])

  const toggleLike = async () => {
    if (!user) return
    if (liked) {
      setLiked(false)
      setLikes((c) => Math.max(0, c - 1))
      await supabase.from("checkin_likes").delete().eq("checkin_id", checkIn.id).eq("user_id", user.id)
    } else {
      setLiked(true)
      setLikes((c) => c + 1)
      await supabase.from("checkin_likes").insert({ checkin_id: checkIn.id, user_id: user.id })
    }
  }

  const addComment = async () => {
    if (!user || !commentText.trim()) return
    setSubmitting(true)
    const { data } = await supabase
      .from("checkin_comments")
      .insert({ checkin_id: checkIn.id, user_id: user.id, content: commentText.trim() })
      .select()
      .single()

    if (data) {
      setComments((prev) => [...prev, { ...data, profile: { display_name: profile?.display_name || user.email || "?" } }])
      setCommentText("")
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!confirm("Delete this check-in?")) return
    await supabase.from("check_ins").delete().eq("id", checkIn.id)
    onDelete()
  }

  return (
    <div className="bg-white animate-slide-up" style={{
      border: "2px solid #e2e8f0",
      boxShadow: "3px 3px 0 0 rgba(0,0,0,0.03)",
    }}>
      {/* User info row */}
      <div className="flex items-center gap-2 p-4 pb-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold font-mono text-blue-600 flex-shrink-0">
          {(profile?.display_name || "?").slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold font-mono text-slate-700 truncate">
            {profile?.display_name || "Unknown"}
          </p>
          <p className="text-[10px] font-mono text-slate-400">{timeAgo(checkIn.created_at)}</p>
        </div>
        {isOwner && (
          <button onClick={handleDelete} className="text-[10px] font-mono text-slate-300 hover:text-red-400 transition">
            🗑
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-sm font-bold font-mono text-slate-800">📍 {checkIn.spot_name}</p>
        {checkIn.spot_location && (
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{checkIn.spot_location}</p>
        )}
      </div>

      {checkIn.content && (
        <p className="px-4 pb-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{checkIn.content}</p>
      )}

      {checkIn.photos && checkIn.photos.length > 0 && (
        <PhotoGrid photos={checkIn.photos} />
      )}

      {/* Actions bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-t border-slate-100 mt-2">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono transition ${
            liked ? "text-red-500 bg-red-50" : "text-slate-400 hover:text-red-400 hover:bg-red-50"
          }`}
        >
          {liked ? "❤️" : "🤍"} {likes > 0 && <span>{likes}</span>}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono transition ${
            showComments ? "text-blue-500 bg-blue-50" : "text-slate-400 hover:text-blue-400 hover:bg-blue-50"
          }`}
        >
          💬 {comments.length > 0 && <span>{comments.length}</span>}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          <div className="px-4 py-2 space-y-2 max-h-48 overflow-y-auto">
            {comments.length === 0 && (
              <p className="text-[10px] font-mono text-slate-300 text-center py-2">No comments yet</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <span className="text-[10px] font-bold font-mono text-slate-500 flex-shrink-0">
                  {c.profile?.display_name || "?"}
                </span>
                <p className="text-xs text-slate-600">{c.content}</p>
              </div>
            ))}
          </div>
          {user && (
            <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-100 bg-white">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="Add a comment..."
                className="flex-1 text-xs px-2 py-1.5 border border-slate-200 outline-none font-mono focus:border-blue-300"
              />
              <button
                onClick={addComment}
                disabled={submitting || !commentText.trim()}
                className="text-xs px-3 py-1.5 bg-blue-500 text-white font-mono disabled:opacity-30 hover:bg-blue-600 transition"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
