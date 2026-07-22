import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getLocationsByGroupIds } from "@/lib/data/locations"
import { generateItinerary } from "@/lib/ai/itinerary-generator"
import { checkRateLimit } from "@/lib/utils/rate-limit"

const requestSchema = z.object({
  groupIds: z.array(z.string()).min(1).max(5),
  days: z.number().int().min(1).max(5),
  preferences: z.record(z.string(), z.boolean()).optional(),
  budget: z.enum(["budget", "medium", "luxury"]).default("medium"),
  pendingSpotIds: z.array(z.string()).max(10).default([]),
})

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { allowed, remaining, resetAt } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Daily limit reached (5/day). Please try again tomorrow." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(resetAt),
        },
      }
    )
  }

  try {
    const body = await request.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { groupIds, days, preferences, budget, pendingSpotIds } = parsed.data

    // Get locations by group IDs from static data
    const locations = getLocationsByGroupIds(groupIds)

    if (locations.length === 0) {
      return NextResponse.json(
        { success: false, error: "No locations found for selected groups. Please try other groups." },
        { status: 404 }
      )
    }

    // Generate itinerary with 3-tier fallback
    const itinerary = await generateItinerary(locations, days, preferences || {}, budget, pendingSpotIds)

    const totalSpots = itinerary.days.reduce((sum, d) => sum + d.spots.length, 0)

    return NextResponse.json(
      {
        success: true,
        data: {
          itinerary: {
            ...itinerary,
            params: { groupIds, days, preferences: preferences || {}, budget },
            totalSpots,
          },
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(resetAt),
        },
      }
    )
  } catch (err) {
    console.error("Itinerary generation error:", err)
    return NextResponse.json(
      { success: false, error: "Failed to generate itinerary. Please try again later." },
      { status: 500 }
    )
  }
}
