import { addPendingSpot as addSupabaseSpot, removePendingSpot as removeSupabaseSpot, getPendingSpots as getSupabaseSpots } from "@/lib/supabase/pending-spots"

interface PendingSpot {
  locationId: string
  locationName: string
  locationType: string
}

const STORAGE_KEY = "kpop_pending_spots"

export function getPendingSpots(): PendingSpot[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

export function addPendingSpot(spot: PendingSpot, userId?: string): void {
  const spots = getPendingSpots()
  if (!spots.some((s) => s.locationId === spot.locationId)) {
    spots.push(spot)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spots))
  }
  if (userId) {
    addSupabaseSpot(userId, spot)
  }
}

export function removePendingSpot(locationId: string, userId?: string): void {
  const spots = getPendingSpots().filter((s) => s.locationId !== locationId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spots))
  if (userId) {
    removeSupabaseSpot(userId, locationId)
  }
}

export async function loadPendingSpots(userId?: string): Promise<PendingSpot[]> {
  if (userId) {
    try {
      const data = await getSupabaseSpots(userId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      return data
    } catch {
      return getPendingSpots()
    }
  }
  return getPendingSpots()
}
