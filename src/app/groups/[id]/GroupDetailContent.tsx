"use client"

import { notFound } from "next/navigation"
import type { Group, Location } from "@/types"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"
import Link from "next/link"
import PhotoUploader from "@/components/location/PhotoUploader"

const PIXEL_ICONS: Record<string, string> = {
  company: "▣",
  restaurant: "◆",
  mv_spot: "▶",
  store: "◉",
  entertainment: "★",
}

interface Props {
  group: Group | undefined
  relatedLocations: Location[]
}

export default function GroupDetailContent({ group, relatedLocations }: Props) {
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

      {/* Header - Pixel style */}
      <div
        className="p-6 mb-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${group.color}, ${group.color}dd)`,
          border: "3px solid #1e293b",
          boxShadow: "4px 4px 0 0 rgba(0,0,0,0.2)",
        }}
      >
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="w-2 h-2 bg-white/60" />
          <div className="w-2 h-2 bg-white/40" />
          <div className="w-2 h-2 bg-white/60" />
        </div>

        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 flex items-center justify-center text-2xl font-bold font-mono"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.5)",
              imageRendering: "pixelated",
            }}
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
              <span className="pixel-tag bg-white/20 text-white border-white/30 text-[10px]">
                {group.company}
              </span>
              <span className="pixel-tag bg-white/20 text-white border-white/30 text-[10px]">
                GEN {group.generation}
              </span>
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-3 gap-4 mt-4 pt-4 text-center"
          style={{ borderTop: "2px dashed rgba(255,255,255,0.3)" }}
        >
          <div>
            <p className="text-2xl font-bold font-mono">{group.debutYear}</p>
            <p className="text-xs font-mono text-white/70">DEBUT</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{group.memberCount}</p>
            <p className="text-xs font-mono text-white/70">MEMBERS</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono">{group.fandomName}</p>
            <p className="text-xs font-mono text-white/70">FANDOM</p>
          </div>
        </div>
      </div>

      {/* Related Locations */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold pixel-font text-slate-800">
          {relatedLocations.length} SPOTS
        </h2>
        <span className="text-xs font-mono text-slate-400">
          click card for details · upload your photos 📷
        </span>
      </div>

      {relatedLocations.length > 0 ? (
        <div className="space-y-4">
          {relatedLocations.map((loc) => {
            const typeInfo = LOCATION_TYPES[loc.type]
            const pixelIcon = PIXEL_ICONS[loc.type] || "●"
            return (
              <div
                key={loc.id}
                className="pixel-card p-4 bg-white animate-slide-up"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/locations/${loc.id}`}
                      className="group inline-block"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-8 h-8 flex items-center justify-center text-sm text-white font-mono font-bold flex-shrink-0"
                          style={{
                            backgroundColor: typeInfo.color,
                            border: "2px solid #1e293b",
                          }}
                        >
                          {pixelIcon}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm text-slate-800 pixel-font group-hover:text-blue-600 transition-colors">
                            {loc.name}
                          </h3>
                          <p className="text-xs text-slate-400">{loc.nameKo}</p>
                        </div>
                        {loc.rating && (
                          <span className="ml-auto text-amber-400 text-sm font-mono font-bold">
                            ★ {loc.rating}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="flex flex-wrap gap-1 mb-2 ml-10">
                      <span className="pixel-tag text-white text-[10px]" style={{ backgroundColor: typeInfo.color }}>
                        {TYPE_NAME_CN[loc.type]}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        📍 {loc.location.district} · {loc.location.neighborhood}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {loc.price.isFree ? "FREE" : loc.price.range}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 ml-10 font-mono">
                      {loc.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <Link
                      href={`/locations/${loc.id}`}
                      className="pixel-btn px-3 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 text-center whitespace-nowrap"
                    >
                      DETAILS ▶
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${loc.location.latitude},${loc.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pixel-btn px-3 py-1.5 text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 text-center whitespace-nowrap"
                    >
                      MAP ▶
                    </a>
                  </div>
                </div>

                {/* Photo upload section */}
                <div className="ml-10">
                  <PhotoUploader locationId={loc.id} locationName={loc.name} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-mono text-slate-400">
            No locations found for {group.name} yet.
          </p>
        </div>
      )}
    </div>
  )
}
