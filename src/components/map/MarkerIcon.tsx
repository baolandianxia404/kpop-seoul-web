import type { LocationType } from "@/types"
import { MARKER_COLORS } from "@/lib/utils/constants"

export default function MarkerIcon({
  type,
  label,
}: {
  type: LocationType
  label?: string
}) {
  const color = MARKER_COLORS[type]
  const icons: Record<LocationType, string> = {
    company: "🏢",
    restaurant: "🍽",
    mv_spot: "🎬",
    store: "🛍",
    entertainment: "🎡",
  }

  return (
    <div className="flex flex-col items-center -translate-y-1/2">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-sm"
        style={{ backgroundColor: color }}
      >
        {label || icons[type]}
      </div>
      <div
        className="w-1 h-3 rounded-b"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}
