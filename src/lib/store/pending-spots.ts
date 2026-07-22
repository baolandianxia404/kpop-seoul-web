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

export function addPendingSpot(spot: PendingSpot): void {
  const spots = getPendingSpots()
  if (!spots.some((s) => s.locationId === spot.locationId)) {
    spots.push(spot)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spots))
  }
}

export function removePendingSpot(locationId: string): void {
  const spots = getPendingSpots().filter((s) => s.locationId !== locationId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spots))
}
