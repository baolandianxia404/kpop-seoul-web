import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { groups, getGroupById } from "@/lib/data/groups"
import { getLocationsByGroup, locations } from "@/lib/data/locations"
import LocationCard from "@/components/location/LocationCard"
import Link from "next/link"

export function generateStaticParams() {
  return groups.map((g) => ({ id: g.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const group = getGroupById(id)
  if (!group) return { title: "Not Found" }
  return {
    title: `${group.name} (${group.nameKo}) Seoul Spots — Kpop Seoul Map`,
    description: `Find ${group.name} company building, filming locations, favorite restaurants, and more in Seoul. Plan your ${group.fandomName} pilgrimage trip.`,
  }
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const group = getGroupById(id)
  if (!group) notFound()

  const relatedLocations = getLocationsByGroup(group.name)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/groups" className="hover:text-purple-600">
          Groups
        </Link>
        <span className="mx-2">/</span>
        <span>{group.name}</span>
      </nav>

      {/* Header */}
      <div
        className="p-6 rounded-2xl mb-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${group.color}, ${group.color}dd)`,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold bg-white/20 backdrop-blur"
          >
            {group.name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-white/80">{group.nameKo}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/20">
                {group.type === "boy_group"
                  ? "Boy Group"
                  : group.type === "girl_group"
                  ? "Girl Group"
                  : group.type === "band"
                  ? "Band"
                  : "Solo"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/20">
                {group.company}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/20">
                Gen {group.generation}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <p className="text-2xl font-bold">{group.debutYear}</p>
            <p className="text-xs text-white/70">Debut</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{group.memberCount}</p>
            <p className="text-xs text-white/70">Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{group.fandomName}</p>
            <p className="text-xs text-white/70">Fandom</p>
          </div>
        </div>
      </div>

      {/* Related Locations */}
      <h2 className="text-xl font-semibold mb-4">
        {relatedLocations.length} Seoul Spots
      </h2>
      {relatedLocations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedLocations.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No locations found for this group yet.</p>
      )}
    </div>
  )
}
