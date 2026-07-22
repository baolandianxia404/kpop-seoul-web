import type { Location } from "@/types"

interface SpotInput {
  id: string
  name: string
  type: string
  lat: number
  lng: number
  district: string
  neighborhood: string
  hours: string
  duration: number
  groupNames: string[]
}

function simplifyLocations(locations: Location[]): SpotInput[] {
  return locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    type: loc.type,
    lat: loc.location.latitude,
    lng: loc.location.longitude,
    district: loc.location.district,
    neighborhood: loc.location.neighborhood || "",
    hours: loc.hours ? `${loc.hours.weekday || ""} ${loc.hours.closed || ""}` : "",
    duration: loc.estimatedDuration || 60,
    groupNames: (loc.groupNames || []).slice(0, 3),
  }))
}

export async function callDeepSeek(
  locations: Location[],
  days: number,
  preferences: Record<string, unknown>,
  budget: string,
  systemPrompt: string
) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured")

  const simplified = simplifyLocations(locations)
  const userPrompt = JSON.stringify({
    locations: simplified,
    days,
    preferences,
    budget,
    instruction:
      "Please strictly follow the output format. Ensure each spot's locationId matches the id field in the input data.",
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`DeepSeek API returned ${res.status}`)
    }

    const data = await res.json()
    const content = data.choices[0].message.content as string
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("DeepSeek response format error")
    return JSON.parse(jsonMatch[0])
  } finally {
    clearTimeout(timeout)
  }
}
