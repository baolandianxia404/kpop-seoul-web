import { groups, getGroupById } from "@/lib/data/groups"
import HouseContent from "./HouseContent"
import type { Metadata } from "next"

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
    title: `${group.name} House — Fan Check-ins`,
    description: `Join ${group.name}'s fan house! Share your Kpop pilgrimage check-ins, photos, and stories with fellow ${group.fandomName}.`,
  }
}

export default function HousePage({ params }: { params: Promise<{ id: string }> }) {
  return <HouseContent params={params} />
}
