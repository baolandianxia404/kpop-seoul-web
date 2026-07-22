import type { Location, LocationType, Filters } from '@/types'

export function filterLocations(
  locations: Location[],
  filters: Partial<Filters>,
  keyword?: string
): Location[] {
  let result = [...locations]

  if (filters.type) {
    result = result.filter(l => l.type === filters.type)
  }
  if (filters.district) {
    result = result.filter(l => l.location.district === filters.district)
  }
  if (filters.groupId) {
    result = result.filter(l => l.groupNames.some(g => g === filters.groupId))
  }
  if (keyword) {
    const kw = keyword.toLowerCase()
    result = result.filter(
      l =>
        l.name.toLowerCase().includes(kw) ||
        l.nameKo.includes(kw) ||
        l.location.address.includes(kw) ||
        l.groupNames.some(g => g.toLowerCase().includes(kw))
    )
  }

  return result
}

export function getVisibleTypes(zoom: number): LocationType[] | null {
  if (zoom <= 11) return ['company']
  if (zoom <= 13) return ['company', 'entertainment', 'mv_spot']
  return null
}

export function getVisibleBounds(
  center: { lat: number; lng: number },
  zoom: number,
  padding = 0.3
) {
  const base = 0.5 * Math.pow(2, 12 - zoom)
  const latDelta = base * (1 + padding)
  const lngDelta = base * 1.6 * (1 + padding)
  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  }
}

export function isInBounds(
  location: Location,
  bounds: ReturnType<typeof getVisibleBounds>
): boolean {
  return (
    location.location.latitude >= bounds.minLat &&
    location.location.latitude <= bounds.maxLat &&
    location.location.longitude >= bounds.minLng &&
    location.location.longitude <= bounds.maxLng
  )
}
