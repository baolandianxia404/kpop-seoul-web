"use client"

import { useState, useEffect, useCallback } from "react"

interface StoredPhoto {
  id: string
  dataUrl: string
  createdAt: string
}

function compressImage(file: File, maxWidth = 800, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL("image/jpeg", quality))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getStorageKey(locationId: string) {
  return `kpop_photos_${locationId}`
}

function loadPhotos(locationId: string): StoredPhoto[] {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(locationId)) || "[]")
  } catch {
    return []
  }
}

function savePhotos(locationId: string, photos: StoredPhoto[]) {
  // Limit total size: keep at most 10 photos
  const trimmed = photos.slice(0, 10)
  try {
    localStorage.setItem(getStorageKey(locationId), JSON.stringify(trimmed))
  } catch {
    // Storage full: remove oldest photos
    const half = trimmed.slice(Math.floor(trimmed.length / 2))
    try {
      localStorage.setItem(getStorageKey(locationId), JSON.stringify(half))
    } catch {}
  }
}

export default function PhotoUploader({ locationId, locationName }: { locationId: string; locationName: string }) {
  const [photos, setPhotos] = useState<StoredPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [message, setMessage] = useState("")

  useEffect(() => {
    setPhotos(loadPhotos(locationId))
  }, [locationId])

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      setUploading(true)
      setMessage("")

      const newPhotos: StoredPhoto[] = []
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue
        if (file.size > 10 * 1024 * 1024) {
          setMessage("Max 10MB per photo")
          continue
        }
        try {
          const dataUrl = await compressImage(file)
          newPhotos.push({
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            dataUrl,
            createdAt: new Date().toISOString(),
          })
        } catch {
          setMessage("Failed to process image")
        }
      }

      if (newPhotos.length > 0) {
        const updated = [...newPhotos, ...photos]
        setPhotos(updated)
        savePhotos(locationId, updated)
        setMessage(`Added ${newPhotos.length} photo(s)!`)
      }

      setUploading(false)
      e.target.value = ""
    },
    [photos, locationId]
  )

  const handleDelete = useCallback(
    (photoId: string) => {
      const updated = photos.filter((p) => p.id !== photoId)
      setPhotos(updated)
      savePhotos(locationId, updated)
    },
    [photos, locationId]
  )

  return (
    <div className="mt-3">
      {/* Upload button */}
      <div className="flex items-center gap-2">
        <label className="pixel-btn px-3 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer inline-flex items-center gap-1">
          <span>📷</span> ADD PHOTO
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {uploading && (
          <span className="text-xs font-mono text-slate-400 animate-pulse">
            PROCESSING...
          </span>
        )}
        {message && (
          <span className="text-xs font-mono text-green-600">{message}</span>
        )}
      </div>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
          {photos.map((photo, idx) => (
            <div key={photo.id} className="relative flex-shrink-0 group">
              <img
                src={photo.dataUrl}
                alt={`${locationName} photo ${idx + 1}`}
                className="w-20 h-20 object-cover cursor-pointer"
                style={{ border: "2px solid #1e293b", imageRendering: "pixelated" }}
                onClick={() => {
                  setViewerIndex(idx)
                  setViewerOpen(true)
                }}
              />
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-mono flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ border: "2px solid #1e293b" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen viewer */}
      {viewerOpen && (
        <div
          className="fixed inset-0 z-[2000] bg-slate-900/90 flex items-center justify-center p-4"
          onClick={() => setViewerOpen(false)}
        >
          <button
            onClick={() => setViewerOpen(false)}
            className="absolute top-4 right-4 text-white font-mono text-lg pixel-btn px-3 py-1 bg-red-500"
          >
            [X]
          </button>
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setViewerIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
                }}
                className="absolute left-4 text-white font-mono text-2xl pixel-btn px-3 py-1 bg-slate-700"
              >
                ◀
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setViewerIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
                }}
                className="absolute right-4 text-white font-mono text-2xl pixel-btn px-3 py-1 bg-slate-700"
              >
                ▶
              </button>
            </>
          )}
          <img
            src={photos[viewerIndex].dataUrl}
            alt={`${locationName} photo`}
            className="max-w-full max-h-[85vh] object-contain"
            style={{ border: "4px solid white" }}
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 text-white font-mono text-sm">
            {viewerIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </div>
  )
}
