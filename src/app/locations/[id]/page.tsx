import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLocationById, locations } from "@/lib/data/locations"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"
import { getDistance } from "@/lib/utils/distance"
import TransportSection from "@/components/location/TransportSection"
import HoursSection from "@/components/location/HoursSection"
import TipsSection from "@/components/location/TipsSection"
import Link from "next/link"

export function generateStaticParams() {
  return locations.map((loc) => ({ id: loc.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const loc = getLocationById(id)
  if (!loc) return { title: "Not Found" }
  return {
    title: `${loc.name} (${loc.nameKo}) — Kpop Seoul Map`,
    description: `Visit ${loc.name} in ${loc.location.district}, Seoul. ${loc.description.slice(0, 150)}`,
    openGraph: {
      title: `${loc.name} — Kpop Filming Location in Seoul`,
      description: loc.description.slice(0, 200),
      type: "article",
    },
    alternates: { canonical: `https://kpopseoulmap.com/locations/${id}` },
  }
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const loc = getLocationById(id)
  if (!loc) notFound()

  const typeInfo = LOCATION_TYPES[loc.type]
  const nearby = locations
    .filter(
      (l) => l.id !== loc.id && l.location.district === loc.location.district
    )
    .sort(
      (a, b) =>
        getDistance(
          loc.location.latitude,
          loc.location.longitude,
          a.location.latitude,
          a.location.longitude
        ) -
        getDistance(
          loc.location.latitude,
          loc.location.longitude,
          b.location.latitude,
          b.location.longitude
        )
    )
    .slice(0, 5)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: `${loc.name} (${loc.nameKo})`,
    description: loc.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: loc.location.address,
      addressLocality: loc.location.district,
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: loc.location.latitude,
      longitude: loc.location.longitude,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-purple-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/locations" className="hover:text-purple-600">
            Locations
          </Link>
          <span className="mx-2">/</span>
          <span>{loc.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">{loc.name}</h1>
          <p className="text-lg text-gray-500 mb-3">{loc.nameKo}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium text-white`} style={{ backgroundColor: typeInfo.color }}>
              {TYPE_NAME_CN[loc.type]} / {typeInfo.name}
            </span>
            {loc.groupNames.map((g) => (
              <Link
                key={g}
                href={`/groups/${g.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                {g}
              </Link>
            ))}
          </div>
        </div>

        {/* Rating */}
        {loc.rating && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-yellow-500 text-lg">★</span>
            <span className="font-semibold">{loc.rating}</span>
          </div>
        )}

        {/* Description */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-gray-700 leading-relaxed">{loc.description}</p>
          {loc.tips && (
            <div className="mt-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Tip: </span>
                {loc.tips}
              </p>
            </div>
          )}
        </section>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Address */}
          <div className="p-4 bg-white rounded-xl border border-gray-100">
            <h3 className="font-semibold text-sm mb-1">Address</h3>
            <p className="text-sm text-gray-600">{loc.location.address}</p>
            <p className="text-xs text-gray-400 mt-1">{loc.location.addressKo}</p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${loc.location.latitude},${loc.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
            >
              Open in Google Maps
            </a>
          </div>

          {/* Transport */}
          <TransportSection transport={loc.transport} />

          {/* Hours */}
          <HoursSection hours={loc.hours} />

          {/* Price */}
          <div className="p-4 bg-white rounded-xl border border-gray-100">
            <h3 className="font-semibold text-sm mb-1">Price</h3>
            <p className="text-sm text-gray-600">
              {loc.price.isFree ? "Free" : loc.price.range}
            </p>
            {loc.price.note && (
              <p className="text-xs text-gray-400 mt-1">{loc.price.note}</p>
            )}
          </div>

          {/* Duration */}
          <div className="p-4 bg-white rounded-xl border border-gray-100">
            <h3 className="font-semibold text-sm mb-1">Suggested Duration</h3>
            <p className="text-sm text-gray-600">
              ~{loc.estimatedDuration} minutes
            </p>
          </div>
        </div>

        {/* Check-in Tips */}
        {loc.checkInTips && loc.checkInTips.length > 0 && (
          <TipsSection tips={loc.checkInTips} />
        )}

        {/* Nearby */}
        {nearby.length > 0 && (
          <section className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-4">
              Nearby in {loc.location.district}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nearby.map((n) => (
                <Link
                  key={n.id}
                  href={`/locations/${n.id}`}
                  className="p-3 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition"
                >
                  <p className="font-medium text-sm">{n.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {LOCATION_TYPES[n.type].name} ·{" "}
                    {getDistance(
                      loc.location.latitude,
                      loc.location.longitude,
                      n.location.latitude,
                      n.location.longitude
                    ) < 1000
                      ? `${Math.round(
                          getDistance(
                            loc.location.latitude,
                            loc.location.longitude,
                            n.location.latitude,
                            n.location.longitude
                          )
                        )}m away`
                      : `${(
                          getDistance(
                            loc.location.latitude,
                            loc.location.longitude,
                            n.location.latitude,
                            n.location.longitude
                          ) / 1000
                        ).toFixed(1)}km away`}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
