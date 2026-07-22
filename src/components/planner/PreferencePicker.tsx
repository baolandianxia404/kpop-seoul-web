"use client"

import { PREFERENCES_OPTIONS } from "@/lib/utils/constants"
import type { Preferences } from "@/types"

interface Props {
  preferences: Preferences
  onChange: (p: Preferences) => void
}

export default function PreferencePicker({ preferences, onChange }: Props) {
  const toggle = (key: keyof Preferences) => {
    onChange({ ...preferences, [key]: !preferences[key] })
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">Interests (optional)</label>
      <div className="flex flex-wrap gap-2">
        {PREFERENCES_OPTIONS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              preferences[key]
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>
    </div>
  )
}
