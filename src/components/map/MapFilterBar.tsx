"use client"

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

  return (
    <div className="flex flex-col gap-2">
      {/* Type filters */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              activeType === t
                ? "text-white shadow-md"
                : "bg-white/90 text-gray-600 hover:bg-white"
            }`}
            style={
              activeType === t && t
                ? { backgroundColor: LOCATION_TYPES[t].color }
                : activeType === "" && t === ""
                ? { backgroundColor: "#7c3aed" }
                : {}
            }
          >
            {t === "" ? "All" : `${LOCATION_TYPES[t].icon} ${TYPE_NAME_CN[t]}`}
          </button>
        ))}
      </div>

      {/* District quick select */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onDistrictChange("")}
          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition ${
            activeDistrict === ""
              ? "bg-gray-800 text-white"
              : "bg-white/80 text-gray-600 hover:bg-white"
          }`}
        >
          All Areas
        </button>
        {DISTRICTS.slice(0, 8).map((d) => (
          <button
            key={d}
            onClick={() => onDistrictChange(d)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs transition ${
              activeDistrict === d
                ? "bg-gray-800 text-white"
                : "bg-white/80 text-gray-600 hover:bg-white"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}
