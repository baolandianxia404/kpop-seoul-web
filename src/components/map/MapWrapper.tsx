"use client"

import dynamic from "next/dynamic"
import type { Location } from "@/types"

const KpopMap = dynamic(() => import("./KpopMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
})

export default function MapWrapper({ locations }: { locations: Location[] }) {
  return <KpopMap locations={locations} />
}
