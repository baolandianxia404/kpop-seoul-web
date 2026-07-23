"use client"

import AuthProvider from "@/components/auth/AuthProvider"

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
