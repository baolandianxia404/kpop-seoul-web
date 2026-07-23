import type { MetadataRoute } from "next"
import { getLocationIds } from "@/lib/data/locations"
import { getGroupIds } from "@/lib/data/groups"

export const dynamic = "force-static"

const BASE_URL = "https://kpopseoulmap.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const locationUrls: MetadataRoute.Sitemap = getLocationIds().map((id) => ({
    url: `${BASE_URL}/locations/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const groupUrls: MetadataRoute.Sitemap = getGroupIds().map((id) => ({
    url: `${BASE_URL}/groups/${id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/locations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/groups`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/planner`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...locationUrls,
    ...groupUrls,
  ]
}
