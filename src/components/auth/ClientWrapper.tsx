"use client"

import AuthProvider from "@/components/auth/AuthProvider"
import { FavoritesProvider } from "@/lib/store/favorites"
import PresenceTracker from "@/components/ui/PresenceTracker"

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <PresenceTracker />
        {children}
      </FavoritesProvider>
    </AuthProvider>
  )
}
