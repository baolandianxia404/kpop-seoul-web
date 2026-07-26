"use client"

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import { createClient } from "@/lib/supabase/client"

const STORAGE_KEY = "kpop_favorites"

function getLocalFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
  catch { return [] }
}

function setLocalFavorites(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

interface FavoritesContextType {
  favorites: string[]
  loading: boolean
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => Promise<boolean>
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  loading: true,
  isFavorite: () => false,
  toggleFavorite: async () => false,
})

export function useFavorites() {
  return useContext(FavoritesContext)
}

import { useAuth } from "@/components/auth/AuthProvider"

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Load favorites from Supabase (if logged in) or localStorage
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (user) {
        const supabase = createClient()
        const { data } = await supabase
          .from("user_favorites")
          .select("location_id")
          .eq("user_id", user.id)
        if (!cancelled) {
          const ids = (data || []).map((r: { location_id: string }) => r.location_id)
          setFavorites(ids)
          setLocalFavorites(ids) // sync cache
          setLoading(false)
        }
      } else {
        if (!cancelled) {
          setFavorites(getLocalFavorites())
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [user])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  const toggleFavorite = useCallback(async (id: string): Promise<boolean> => {
    const exists = favorites.includes(id)
    const next = exists ? favorites.filter((f) => f !== id) : [...favorites, id]
    setFavorites(next)
    setLocalFavorites(next)

    if (user) {
      const supabase = createClient()
      if (exists) {
        await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("location_id", id)
      } else {
        await supabase.from("user_favorites").insert({ user_id: user.id, location_id: id })
      }
    }

    return !exists
  }, [favorites, user])

  return (
    <FavoritesContext.Provider value={{ favorites, loading, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}