import { createClient } from "@/lib/supabase/client"

interface PendingSpot {
  locationId: string
  locationName: string
  locationType: string
}

export async function getPendingSpots(userId: string): Promise<PendingSpot[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("pending_spots")
    .select("location_id, location_name, location_type")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
  return (data || []).map((r: { location_id: string; location_name: string; location_type: string }) => ({
    locationId: r.location_id,
    locationName: r.location_name,
    locationType: r.location_type,
  }))
}

export async function addPendingSpot(userId: string, spot: PendingSpot): Promise<void> {
  const supabase = createClient()
  const { data: existing } = await supabase
    .from("pending_spots")
    .select("location_id")
    .eq("user_id", userId)
    .eq("location_id", spot.locationId)
    .maybeSingle()
  if (!existing) {
    await supabase.from("pending_spots").insert({
      user_id: userId,
      location_id: spot.locationId,
      location_name: spot.locationName,
      location_type: spot.locationType,
    })
  }
}

export async function removePendingSpot(userId: string, locationId: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from("pending_spots")
    .delete()
    .eq("user_id", userId)
    .eq("location_id", locationId)
}

export async function syncPendingSpotsOnLogin(userId: string): Promise<void> {
  try {
    const local = JSON.parse(localStorage.getItem("kpop_pending_spots") || "[]") as PendingSpot[]
    if (local.length === 0) return
    const remote = await getPendingSpots(userId)
    const remoteIds = new Set(remote.map((r) => r.locationId))
    for (const spot of local) {
      if (!remoteIds.has(spot.locationId)) {
        await addPendingSpot(userId, spot)
      }
    }
    const merged = await getPendingSpots(userId)
    localStorage.setItem("kpop_pending_spots", JSON.stringify(merged))
  } catch {}
}
