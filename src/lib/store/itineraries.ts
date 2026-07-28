import type { Itinerary } from "@/types"
import { getItineraries as getSupabaseItineraries, saveItinerary as saveSupabaseItinerary, deleteItinerary as deleteSupabaseItinerary } from "@/lib/supabase/itineraries"

const STORAGE_KEY = "kpop_itineraries"
const MAX_ITEMS = 10

export function getItineraries(): Itinerary[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

export function saveItinerary(itinerary: Itinerary, userId?: string): void {
  const items = getItineraries()
  const existingIdx = items.findIndex((i) => i.title === itinerary.title)
  if (existingIdx >= 0) {
    items[existingIdx] = itinerary
  } else {
    items.unshift(itinerary)
  }
  const trimmed = items.slice(0, MAX_ITEMS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))

  if (userId) {
    saveSupabaseItinerary(userId, itinerary)
  }
}

export function removeItinerary(title: string, userId?: string): void {
  const items = getItineraries().filter((i) => i.title !== title)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))

  if (userId) {
    deleteSupabaseItinerary(userId, title)
  }
}

export async function loadItineraries(userId?: string): Promise<Itinerary[]> {
  if (userId) {
    try {
      const data = await getSupabaseItineraries(userId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      return data
    } catch {
      return getItineraries()
    }
  }
  return getItineraries()
}
