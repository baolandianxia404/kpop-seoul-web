"use client"

import { useState } from "react"
import type { LocationType } from "@/types"
import { LOCATION_TYPES, TYPE_NAME_CN, DISTRICTS } from "@/lib/utils/constants"

interface Props {
  activeType: LocationType | ""
  activeDistrict: string
  onTypeChange: (type: LocationType | "") => void
  onDistrictChange: (district: string) => void
}

export default function MapFilterBar({
  activeType,
  activeDistrict,
  onTypeChange,
  onDistrictChange,
}: Props) {
  const types: (LocationType | "")[] = ["", "company", "restaurant", "mv_spot", "store", "entertainment"]
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      {/* Toggle collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="self-end w-7 h-7 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-xs text-gray-400 hover:text-gray-600 transition"
      >
        {collapsed ? "+" : "−"}
      </button>

      {!collapsed && (
        <>
          {/* Type filters */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar animate-slide-up">
            {types.map((t) => {
              const isActive = activeType === t
              const color = t === ""
                ? "#3b82f6"
                : LOCATION_TYPES[t].color
              return (
                <button
                  key={t}
                  onClick={() => onTypeChange(t)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 hover-wiggle ${
                    isActive
                      ? "text-white shadow-lg scale-105"
                      : "bg-white/90 backdrop-blur text-gray-500 hover:bg-white hover:shadow-sm"
                  }`}
                  style={isActive ? { backgroundColor: color } : {}}
                >
                  {t === "" ? "🌸 All" : `${LOCATION_TYPES[t].icon} ${TYPE_NAME_CN[t]}`}
                </button>
              )
            })}
          </div>

          {/* District quick select */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar animate-slide-up">
            <button
              onClick={() => onDistrictChange("")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeDistrict === ""
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white/80 backdrop-blur text-gray-500 hover:bg-white hover:shadow-sm"
              }`}
            >
              🗺 All Areas
            </button>
            {DISTRICTS.slice(0, 8).map((d) => (
              <button
                key={d}
                onClick={() => onDistrictChange(d)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover-wiggle ${
                  activeDistrict === d
                    ? "bg-amber-400 text-white shadow-md"
                    : "bg-white/80 backdrop-blur text-gray-500 hover:bg-white hover:shadow-sm"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
