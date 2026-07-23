"use client"

import dynamic from "next/dynamic"
import type { Location } from "@/types"

const KpopMap = dynamic(() => import("./KpopMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="text-center animate-float">
        <div className="text-5xl mb-3">🗺️</div>
        <div className="flex items-center justify-center gap-1 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
        <p className="text-sm text-gray-400">Loading map...</p>
      </div>
    </div>
  ),
})

export default function MapWrapper({ locations }: { locations: Location[] }) {
  return <KpopMap locations={locations} />
}
