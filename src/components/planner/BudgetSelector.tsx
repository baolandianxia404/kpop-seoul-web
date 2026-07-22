"use client"

import { BUDGET_OPTIONS } from "@/lib/utils/constants"
import type { Budget } from "@/types"

interface Props {
  budget: Budget
  onChange: (b: Budget) => void
}

export default function BudgetSelector({ budget, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">Budget Style</label>
      <div className="grid grid-cols-3 gap-2">
        {BUDGET_OPTIONS.map(({ key, label, desc }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`p-3 rounded-xl border-2 text-center transition ${
              budget === key
                ? "border-purple-500 bg-purple-50"
                : "border-gray-100 hover:border-gray-300"
            }`}
          >
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-gray-400">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
