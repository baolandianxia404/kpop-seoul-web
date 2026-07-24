import type { Location, Itinerary } from "@/types"

export function generateFallbackItinerary(
  locations: Location[],
  days: number,
  pendingSpotIds: string[] = []
): Itinerary {
  const byDistrict: Record<string, Location[]> = {}
  locations.forEach((loc) => {
    const d = loc.location.district
    if (!byDistrict[d]) byDistrict[d] = []
    byDistrict[d].push(loc)
  })

  // Prioritize districts with more spots
  const districts = Object.entries(byDistrict)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, Math.min(days, Object.keys(byDistrict).length))
    .map(([name]) => name)

  // If fewer districts than days, repeat with different spots
  const itineraryDays = districts.map((district, idx) => {
    let spots = byDistrict[district].slice(0, 5)

    spots.sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    )

    return {
      day: idx + 1,
      title: `${district} Kpop Route`,
      description: `Explore ${spots.length} Kpop spots in ${district}`,
      spots: spots.map((loc, i) => ({
        locationId: loc.id,
        locationName: loc.name,
        locationType: loc.type,
        lat: loc.location.latitude,
        lng: loc.location.longitude,
        order: i + 1,
        estimatedArrival: `${String(9 + Math.floor(i * 1.5)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
        estimatedDuration: loc.estimatedDuration || 60,
        note: loc.description ? loc.description.slice(0, 50) : "",
        nextTransport:
          i < 4
            ? { type: "walk" as const, duration: 15, note: "Walk to next spot" }
            : null,
      })),
    }
  })

  return {
    title: `星旅 StarTrail ${days}-Day Tour`,
    days: itineraryDays,
  }
}
