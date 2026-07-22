import type { Itinerary } from "@/types"

const STORAGE_KEY = "kpop_itineraries"
const MAX_ITEMS = 10

export function getItineraries(): Itinerary[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

export function saveItinerary(itinerary: Itinerary): void {
  const items = getItineraries()
  const existingIdx = items.findIndex((i) => i.title === itinerary.title)
  if (existingIdx >= 0) {
    items[existingIdx] = itinerary
  } else {
    items.unshift(itinerary)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

export function removeItinerary(title: string): void {
  const items = getItineraries().filter((i) => i.title !== title)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
