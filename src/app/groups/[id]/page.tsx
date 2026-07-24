import type { Metadata } from "next"
import { groups, getGroupById } from "@/lib/data/groups"
import { getLocationsByGroup } from "@/lib/data/locations"
import GroupDetailContent from "./GroupDetailContent"

export function generateStaticParams() {
  return groups.map((g) => ({ id: g.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const group = getGroupById(id)
  if (!group) return { title: "Not Found" }
  return {
    title: `${group.name} (${group.nameKo}) Seoul Spots — 星旅 StarTrail`,
    description: `Find ${group.name} company building, filming locations, favorite restaurants, and more in Seoul. Plan your ${group.fandomName} pilgrimage trip.`,
  }
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const group = getGroupById(id)
  const relatedLocations = getLocationsByGroup(group?.name || "")

  return <GroupDetailContent group={group} relatedLocations={relatedLocations} />
}
