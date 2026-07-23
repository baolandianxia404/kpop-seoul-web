"use client"

import { useState } from "react"
import Image from "next/image"

export default function PhotoGrid({ photos }: { photos: string[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 gap-1.5">
        {photos.slice(0, 5).map((url, i) => (
          <div
            key={i}
            className="relative aspect-square cursor-pointer overflow-hidden border border-slate-100"
            onClick={() => setExpanded(i)}
          >
            <Image
              src={url}
              alt=""
              fill
              className="object-cover hover:scale-105 transition-transform"
              unoptimized
            />
            {i === 4 && photos.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-bold font-mono">
                +{photos.length - 5}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fullscreen viewer */}
      {expanded !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setExpanded(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl w-10 h-10 flex items-center justify-center"
            onClick={() => setExpanded(null)}
          >
            ✕
          </button>
          {expanded > 0 && (
            <button
              className="absolute left-4 text-white text-2xl w-10 h-10 flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); setExpanded(expanded - 1) }}
            >
              ←
            </button>
          )}
          {expanded < photos.length - 1 && (
            <button
              className="absolute right-4 text-white text-2xl w-10 h-10 flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); setExpanded(expanded + 1) }}
            >
              →
            </button>
          )}
          <div className="relative w-full max-w-2xl max-h-[80vh] aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[expanded]}
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  )
}
