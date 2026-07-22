import type { Location, Itinerary, LocationType } from "@/types"
import { SYSTEM_PROMPT } from "./prompt"
import { callDeepSeek } from "./providers/deepseek"
import { callOpenAI } from "./providers/openai"
import { generateFallbackItinerary } from "./fallback"

export async function generateItinerary(
  locations: Location[],
  days: number,
  preferences: Record<string, unknown>,
  budget: string,
  pendingSpotIds: string[] = []
): Promise<Itinerary> {
  // Tier 1: DeepSeek (primary)
  try {
    const result = await callDeepSeek(locations, days, preferences, budget, SYSTEM_PROMPT)
    return validateAndFix(result, locations)
  } catch (err) {
    console.warn("DeepSeek failed, trying OpenAI fallback:", err)
  }

  // Tier 2: OpenAI (fallback)
  try {
    const result = await callOpenAI(locations, days, preferences, budget, SYSTEM_PROMPT)
    return validateAndFix(result, locations)
  } catch (err) {
    console.warn("OpenAI failed, using rule engine fallback:", err)
  }

  // Tier 3: Rule engine (final fallback)
  return generateFallbackItinerary(locations, days, pendingSpotIds)
}

function validateAndFix(raw: Record<string, unknown>, locations: Location[]): Itinerary {
  const days = raw.days as Array<Record<string, unknown>> | undefined
  if (!days || !Array.isArray(days)) {
    return generateFallbackItinerary(locations, 2)
  }

  const locMap: Record<string, Location> = {}
  locations.forEach((l) => {
    locMap[l.id] = l
  })

  const fixedDays = days
    .filter((d) => {
      const spots = d.spots as Array<Record<string, unknown>> | undefined
      return spots && spots.length > 0
    })
    .map((day, dayIdx) => {
      const rawSpots = (day.spots as Array<Record<string, unknown>>) || []
      const validSpots = rawSpots.filter((s) => locMap[s.locationId as string])

      return {
        day: dayIdx + 1,
        title: (day.title as string) || `Day ${dayIdx + 1}`,
        description: (day.description as string) || "",
        spots: validSpots.map((spot, i) => {
          const loc = locMap[spot.locationId as string]
          return {
            locationId: spot.locationId as string,
            locationName: (spot.locationName as string) || loc.name,
            locationType: ((spot.locationType || loc.type) as LocationType),
            lat: (spot.lat as number) || loc.location.latitude,
            lng: (spot.lng as number) || loc.location.longitude,
            order: i + 1,
            estimatedArrival: (spot.estimatedArrival as string) || "09:00",
            estimatedDuration: (spot.estimatedDuration as number) || loc.estimatedDuration || 60,
            note: (spot.note as string) || "",
            nextTransport: spot.nextTransport
              ? {
                  type: (spot.nextTransport as Record<string, unknown>).type as "walk" | "subway" | "bus",
                  duration: (spot.nextTransport as Record<string, unknown>).duration as number,
                  note: ((spot.nextTransport as Record<string, unknown>).note as string) || "",
                }
              : null,
          }
        }),
      }
    })

  if (fixedDays.length === 0) {
    return generateFallbackItinerary(locations, 2)
  }

  return {
    title: (raw.title as string) || "Kpop Seoul Tour",
    days: fixedDays,
  }
}
