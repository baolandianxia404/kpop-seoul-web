import { TYPE_NAME_CN } from "@/lib/utils/constants"

interface Transport {
  type: "walk" | "subway" | "bus"
  duration: number
  note: string
}

export default function TransportBadge({ transport }: { transport: Transport | null }) {
  if (!transport) return null

  const icons: Record<string, string> = {
    walk: "🚶",
    subway: "🚇",
    bus: "🚌",
  }

  const colors: Record<string, string> = {
    walk: "bg-green-50 text-green-700",
    subway: "bg-blue-50 text-blue-700",
    bus: "bg-orange-50 text-orange-700",
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${colors[transport.type] || ""}`}>
      <span>{icons[transport.type]}</span>
      <span>{transport.duration}min</span>
      {transport.note && <span className="opacity-70">· {transport.note}</span>}
    </div>
  )
}
