import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/saved", "/itinerary"],
    },
    sitemap: "https://kpopseoulmap.com/sitemap.xml",
  }
}
