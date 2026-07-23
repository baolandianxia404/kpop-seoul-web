"use client"

import Image from "next/image"
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

interface Props {
  checkIn: CheckInRow
  onDelete: () => void
}

export default function CheckInCard({ checkIn, onDelete }: Props) {
  const { user } = useAuth()
  const isOwner = user?.id === checkIn.user_id
  const profile = checkIn.profile

  const handleDelete = async () => {
    if (!confirm("Delete this check-in?")) return
    const supabase = createClient()
    await supabase.from("check_ins").delete().eq("id", checkIn.id)
    onDelete()
  }

  return (
    <div className="p-4 bg-white animate-slide-up" style={{
      border: "2px solid #e2e8f0",
      boxShadow: "3px 3px 0 0 rgba(0,0,0,0.03)",
    }}>
      {/* User info row */}
      <div className="flex items-center gap-2 mb-3">
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
          <button
            onClick={handleDelete}
            className="text-[10px] font-mono text-slate-300 hover:text-red-400 transition"
          >
            🗑
          </button>
        )}
      </div>

      {/* Spot info */}
      <div className="mb-2">
        <p className="text-sm font-bold font-mono text-slate-800">
          📍 {checkIn.spot_name}
        </p>
        {checkIn.spot_location && (
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{checkIn.spot_location}</p>
        )}
      </div>

      {/* Content */}
      {checkIn.content && (
        <p className="text-sm text-slate-600 leading-relaxed mb-3 whitespace-pre-wrap">{checkIn.content}</p>
      )}

      {/* Photos */}
      {checkIn.photos && checkIn.photos.length > 0 && (
        <PhotoGrid photos={checkIn.photos} />
      )}
    </div>
  )
}
