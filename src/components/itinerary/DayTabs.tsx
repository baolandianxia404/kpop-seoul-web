"use client"

interface Props {
  activeDay: number
  totalDays: number
  dayTitles: string[]
  onChange: (day: number) => void
}

export default function DayTabs({ activeDay, totalDays, dayTitles, onChange }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar">
      {Array.from({ length: totalDays }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeDay === i
              ? "bg-purple-600 text-white shadow"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Day {i + 1}
          {dayTitles[i] && (
            <span className="block text-xs opacity-70">{dayTitles[i]}</span>
          )}
        </button>
      ))}
    </div>
  )
}
