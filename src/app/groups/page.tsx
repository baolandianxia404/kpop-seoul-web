"use client"

import { groups } from "@/lib/data/groups"
import GroupCard from "@/components/group/GroupCard"
import { useLang } from "@/components/LanguageProvider"

export default function GroupsPage() {
  const { t } = useLang()
  const sorted = [...groups].sort((a, b) => b.popularity - a.popularity)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-2">{t("groups_title")}</h1>
      <p className="text-gray-500 mb-6">
        {groups.length} groups &mdash; select one to see all their Seoul spots
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sorted.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  )
}
