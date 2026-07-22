import Link from "next/link"
import type { Group } from "@/types"

export default function GroupCard({ group }: { group: Group }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="block p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:scale-[1.02] transition text-center"
    >
      <div
        className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-xl font-bold text-white mb-2"
        style={{ backgroundColor: group.color }}
      >
        {group.name[0]}
      </div>
      <h3 className="font-semibold text-sm">{group.name}</h3>
      <p className="text-xs text-gray-400">{group.fandomName}</p>
      <p className="text-xs text-gray-300 mt-1">{group.company}</p>
    </Link>
  )
}
