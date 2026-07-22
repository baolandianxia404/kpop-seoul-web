"use client"

import type { Group } from "@/types"
import { groups } from "@/lib/data/groups"

interface Props {
  selected: string[]
  onChange: (ids: string[]) => void
}

export default function GroupSelector({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else if (selected.length < 5) {
      onChange([...selected, id])
    }
  }

  // Sort by popularity
  const sorted = [...groups].sort((a, b) => b.popularity - a.popularity)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">Select Groups</label>
        <span className="text-xs text-gray-400">{selected.length}/5</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {sorted.map((group) => {
          const active = selected.includes(group.id)
          return (
            <button
              key={group.id}
              onClick={() => toggle(group.id)}
              disabled={!active && selected.length >= 5}
              className={`p-2 rounded-xl border-2 text-center transition text-xs ${
                active
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-100 hover:border-gray-300 disabled:opacity-40"
              }`}
            >
              <div
                className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white text-xs font-bold mb-1"
                style={{ backgroundColor: group.color }}
              >
                {group.name[0]}
              </div>
              <p className="truncate font-medium">{group.name}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
