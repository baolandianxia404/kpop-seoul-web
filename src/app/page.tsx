import MapWrapper from "@/components/map/MapWrapper"
import { locations } from "@/lib/data/locations"

export default function HomePage() {
  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  return (
    <main className="h-[calc(100dvh-64px)]">
      <MapWrapper locations={locations} mapKey={mapKey} />
    </main>
  )
}
