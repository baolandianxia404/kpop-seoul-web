"use client"

import AuthProvider from "@/components/auth/AuthProvider"
import { FavoritesProvider } from "@/lib/store/favorites"

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider><FavoritesProvider>{children}</FavoritesProvider></AuthProvider>
}
