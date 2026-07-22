"use client"

import { DAY_OPTIONS } from "@/lib/utils/constants"

interface Props {
  days: number
  onChange: (days: number) => void
}

export default function DaySelector({ days, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">Trip Duration</label>
      <div className="flex gap-2">
        {DAY_OPTIONS.map((d) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              days === d
                ? "bg-purple-600 text-white shadow"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {d} {d === 1 ? "Day" : "Days"}
          </button>
        ))}
      </div>
    </div>
  )
}
