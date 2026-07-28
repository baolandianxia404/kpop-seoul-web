import { createClient } from "@/lib/supabase/client"
import type { Itinerary } from "@/types"

export async function getItineraries(userId: string): Promise<Itinerary[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("itineraries")
    .select("id, title, data, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10)
  return (data || []).map((row: { id: string; title: string; data: Itinerary; created_at: string }) => ({
    ...row.data,
    _id: row.id,
    title: row.title,
    createdAt: row.created_at,
  }))
}

export async function saveItinerary(userId: string, itinerary: Itinerary): Promise<void> {
  const supabase = createClient()
  const { data: existing } = await supabase
    .from("itineraries")
    .select("id")
    .eq("user_id", userId)
    .eq("title", itinerary.title)
    .maybeSingle()

  if (existing) {
    await supabase
      .from("itineraries")
      .update({ data: itinerary, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
  } else {
    await supabase.from("itineraries").insert({
      user_id: userId,
      title: itinerary.title,
      data: itinerary,
    })
  }
}

export async function deleteItinerary(userId: string, title: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from("itineraries")
    .delete()
    .eq("user_id", userId)
    .eq("title", title)
}

export async function syncItinerariesOnLogin(userId: string): Promise<void> {
  // Merge local itineraries into Supabase
  try {
    const local = JSON.parse(localStorage.getItem("kpop_itineraries") || "[]") as Itinerary[]
    if (local.length === 0) return
    const remote = await getItineraries(userId)
    const remoteTitles = new Set(remote.map((r) => r.title))
    for (const itin of local) {
      if (!remoteTitles.has(itin.title)) {
        await saveItinerary(userId, itin)
      }
    }
    // Refresh localStorage with merged data
    const merged = await getItineraries(userId)
    localStorage.setItem("kpop_itineraries", JSON.stringify(merged))
  } catch {}
}
