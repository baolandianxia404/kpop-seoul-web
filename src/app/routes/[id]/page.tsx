import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { FEATURED_ROUTES, type FeaturedRoute } from "@/lib/data/featured-routes"
import { locations } from "@/lib/data/locations"
import { LOCATION_TYPES } from "@/lib/utils/constants"
import RouteTimeline from "./RouteTimeline"

export function generateStaticParams() {
  return FEATURED_ROUTES.map((r) => ({ id: r.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const route = FEATURED_ROUTES.find((r) => r.id === id)
  if (!route) return { title: "Not Found" }
  return {
    title: `${route.title.zh} — 星旅 StarTrail`,
    description: route.desc.zh,
  }
}

export default async function RouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const route: FeaturedRoute | undefined = FEATURED_ROUTES.find((r) => r.id === id)
  if (!route) notFound()

  const spots = route.locationIds
    .map((lid) => locations.find((l) => l.id === lid))
    .filter((l): l is typeof locations[number] => l !== undefined)

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-b from-[#f0f4ff] via-white to-[#fffdf0]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          href="/routes"
          className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-blue-500 mb-6 transition"
        >
          ← All Routes
        </Link>

        {/* Header */}
        <div
          className="relative overflow-hidden mb-8 text-white rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${route.color}, ${route.color}cc)`,
            border: "3px solid #1e293b",
            boxShadow: "4px 4px 0 0 rgba(0,0,0,0.1)",
          }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{route.emoji}</span>
              <div>
                <h1 className="text-2xl font-bold pixel-font">{route.title.zh}</h1>
                {route.title.en !== route.title.zh && (
                  <p className="text-xs text-white/60 font-mono">{route.title.en}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-white/80">{route.desc.zh}</p>
            <div className="flex items-center gap-3 mt-3 text-white/60 text-xs font-mono">
              <span>📍 {spots.length} spots</span>
              <span>·</span>
              <span>⏱ ~{Math.floor(spots.length * 0.5)}h</span>
            </div>
          </div>
        </div>

        {/* Route Timeline */}
        <RouteTimeline spots={spots} />
      </div>
    </div>
  )
}
