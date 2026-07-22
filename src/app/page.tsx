import MapWrapper from "@/components/map/MapWrapper"
import { locations } from "@/lib/data/locations"

export default function HomePage() {
  return (
    <main className="h-[calc(100dvh-64px)]">
      <MapWrapper locations={locations} />
    </main>
  )
}
