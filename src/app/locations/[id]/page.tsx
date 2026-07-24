import type { Metadata } from "next"
import { getLocationById, locations } from "@/lib/data/locations"
import LocationDetailContent from "./LocationDetailContent"

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
  if (!loc) {
    return <div>Not Found</div>
  }

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
      <LocationDetailContent id={id} />
    </>
  )
}
