"use client"

import { createClient } from "@/lib/supabase/client"

const STORAGE_KEY = "kpop_favorites"

function getLocalFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
  catch { return [] }
}

// Merge local favorites into Supabase on login
export async function syncFavoritesOnLogin(userId: string) {
  const local = getLocalFavorites()
  if (local.length === 0) return
  const supabase = createClient()
  const { data } = await supabase.from("user_favorites").select("location_id").eq("user_id", userId)
  const existing = new Set((data || []).map((r: { location_id: string }) => r.location_id))
  const toInsert = local.filter((id) => !existing.has(id))
  if (toInsert.length > 0) {
    await supabase.from("user_favorites").insert(
      toInsert.map((location_id) => ({ user_id: userId, location_id }))
    )
  }
  // Update localStorage with merged set
  const merged = [...existing, ...toInsert]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
}
