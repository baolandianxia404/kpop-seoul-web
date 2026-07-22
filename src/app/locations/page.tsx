import Link from "next/link"
import type { Metadata } from "next"
import { locations } from "@/lib/data/locations"
import { groups } from "@/lib/data/groups"
import { guides } from "@/lib/data/guides"
import { LOCATION_TYPES, DISTRICTS } from "@/lib/utils/constants"
import LocationCard from "@/components/location/LocationCard"

export const metadata: Metadata = {
  title: "All Kpop Locations in Seoul — Map & Guide",
  description:
    "Browse 170+ Kpop filming locations, idol restaurants, album shops, entertainment companies in Seoul. Filter by type, district, or group.",
}

export default function LocationsPage() {
  const districts = [...new Set(locations.map((l) => l.location.district))].sort()

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-2">Kpop Locations in Seoul</h1>
      <p className="text-gray-500 mb-6">
        {locations.length} spots across {districts.length} districts
      </p>

      {/* Quick Guides */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Quick Guides</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href={`/locations?guide=${guide.id}`}
              className="flex-shrink-0 w-48 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 hover:shadow-md transition"
            >
              <p className="font-semibold text-sm mb-1">{guide.title}</p>
              <p className="text-xs text-gray-500">{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* All Locations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <LocationCard key={loc.id} location={loc} />
        ))}
      </div>
    </div>
  )
}
