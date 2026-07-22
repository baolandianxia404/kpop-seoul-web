import Link from "next/link"
import type { Location } from "@/types"
import { LOCATION_TYPES, TYPE_NAME_CN } from "@/lib/utils/constants"

export default function LocationCard({ location }: { location: Location }) {
  const typeInfo = LOCATION_TYPES[location.type]

  return (
    <Link
      href={`/locations/${location.id}`}
      className="block p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{location.name}</h3>
          <p className="text-xs text-gray-400 truncate">{location.nameKo}</p>
        </div>
        {location.rating && (
          <span className="ml-2 flex-shrink-0 text-sm text-yellow-500">
            ★ {location.rating}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <span
          className="px-2 py-0.5 rounded-full text-xs text-white"
          style={{ backgroundColor: typeInfo.color }}
        >
          {TYPE_NAME_CN[location.type]}
        </span>
        {location.groupNames.slice(0, 2).map((g) => (
          <span
            key={g}
            className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-600"
          >
            {g}
          </span>
        ))}
        {location.groupNames.length > 2 && (
          <span className="text-xs text-gray-400">
            +{location.groupNames.length - 2}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
        {location.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {location.location.district} · {location.location.neighborhood}
        </span>
        <span>
          {location.price.isFree ? "Free" : location.price.range}
        </span>
      </div>
    </Link>
  )
}
