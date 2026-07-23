"use client"

import dynamic from "next/dynamic"

const AuthProvider = dynamic(() => import("@/components/auth/AuthProvider"), {
  ssr: false,
})

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
