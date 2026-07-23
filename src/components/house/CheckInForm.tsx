"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import Image from "next/image"

function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement("canvas")
      const maxW = 800
      let w = img.width
      let h = img.height
      if (w > maxW) { h = (h * maxW) / w; w = maxW }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => {
        if (blob) resolve(new File([blob], file.name, { type: "image/jpeg" }))
        else resolve(file)
      }, "image/jpeg", 0.6)
    }
    img.src = url
  })
}

interface Props {
  groupId: string
  onSuccess: () => void
}

export default function CheckInForm({ groupId, onSuccess }: Props) {
  const { user } = useAuth()
  const [spotName, setSpotName] = useState("")
  const [spotLocation, setSpotLocation] = useState("")
  const [content, setContent] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (photos.length + files.length > 5) {
      setError("Max 5 photos")
      return
    }
    setPhotos((prev) => [...prev, ...files])
    files.forEach((f) => {
      const reader = new FileReader()
      reader.onload = () => setPreviews((p) => [...p, reader.result as string])
      reader.readAsDataURL(f)
    })
    e.target.value = ""
  }

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    if (!spotName.trim()) { setError("Spot name is required."); return }
    if (!user) { setError("Please sign in."); return }

    setSubmitting(true)
    setError("")

    const supabase = createClient()
    const photoUrls: string[] = []

    // Upload photos
    for (const file of photos) {
      const compressed = await compressImage(file)
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
      const { data, error: uploadErr } = await supabase.storage
        .from("checkin-photos")
        .upload(fileName, compressed, { upsert: false })
      if (!uploadErr && data) {
        const { data: urlData } = supabase.storage.from("checkin-photos").getPublicUrl(data.path)
        photoUrls.push(urlData.publicUrl)
      }
    }

    const { error: insertErr } = await supabase.from("check_ins").insert({
      user_id: user.id,
      group_id: groupId,
      spot_name: spotName.trim(),
      spot_location: spotLocation.trim(),
      content: content.trim(),
      photos: photoUrls,
    })

    if (insertErr) setError(insertErr.message)
    else onSuccess()
    setSubmitting(false)
  }

  return (
    <div className="p-4 bg-white border-2 border-blue-200">
      <h3 className="text-sm font-bold pixel-font text-slate-700 mb-3">NEW CHECK-IN</h3>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Spot name * (e.g. HYBE Insight)"
          value={spotName}
          onChange={(e) => setSpotName(e.target.value)}
          className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none font-mono"
        />
        <input
          type="text"
          placeholder="Location (optional, e.g. Seoul, Yongsan-gu)"
          value={spotLocation}
          onChange={(e) => setSpotLocation(e.target.value)}
          className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none font-mono"
        />
        <textarea
          placeholder="Share your experience... 📝"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border-2 border-slate-300 focus:border-blue-400 outline-none font-mono resize-none"
        />

        {/* Photo previews */}
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {previews.map((p, i) => (
              <div key={i} className="relative w-16 h-16 border-2 border-slate-200">
                <Image src={p} alt="" fill className="object-cover" unoptimized />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={photos.length >= 5}
            className="pixel-btn px-3 py-1.5 text-[10px] bg-slate-100 text-slate-600 disabled:opacity-30"
          >
            📷 ADD PHOTO ({photos.length}/5)
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        </div>

        {error && <p className="text-xs font-mono text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting || !spotName.trim()}
          className="w-full py-2.5 btn-cute text-white font-bold rounded-xl disabled:opacity-40 text-sm"
        >
          {submitting ? "Posting..." : "📝 POST CHECK-IN"}
        </button>
      </div>
    </div>
  )
}
