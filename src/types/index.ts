export type LocationType = 'company' | 'restaurant' | 'mv_spot' | 'store' | 'entertainment'

export type GroupType = 'boy_group' | 'girl_group' | 'band' | 'solo'

export type Budget = 'budget' | 'medium' | 'luxury'

export interface Location {
  id: string
  name: string
  nameKo: string
  type: LocationType
  category: string
  groupNames: string[]
  location: {
    latitude: number
    longitude: number
    address: string
    addressKo?: string
    district: string
    neighborhood: string
  }
  transport: {
    subway?: { line: string; station: string; exit: string; walkingMinutes: number }
    bus?: string[]
    note?: string
  }
  hours: {
    weekday?: string
    weekend?: string
    closed?: string
    note?: string
  }
  description: string
  tips?: string
  checkInTips?: string[]
  price: {
    isFree: boolean
    range: string
    note?: string
  }
  estimatedDuration: number
  rating: number
  verified: boolean
}

export interface Group {
  id: string
  name: string
  nameKo: string
  fullName: string
  type: GroupType
  company: string
  debutYear: number
  memberCount: number
  fandomName: string
  color: string
  popularity: number
  logoImage?: string
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  spots: ItinerarySpot[]
}

export interface ItinerarySpot {
  locationId: string
  locationName: string
  locationType: LocationType
  lat: number
  lng: number
  order: number
  estimatedArrival: string
  estimatedDuration: number
  note: string
  nextTransport: TransportInfo | null
}

export interface TransportInfo {
  type: 'walk' | 'subway' | 'bus'
  duration: number
  note: string
}

export interface Itinerary {
  _id?: string
  title: string
  days: ItineraryDay[]
  params?: {
    groupIds: string[]
    days: number
    preferences: Preferences
    budget: Budget
  }
  totalSpots?: number
  createdAt?: string
}

export interface Preferences {
  focusOnCompany: boolean
  focusOnRestaurant: boolean
  focusOnMvSpot: boolean
  focusOnStore: boolean
}

export interface LocationTypeInfo {
  name: string
  icon: string
  color: string
  tagClass: string
}

export interface Guide {
  id: string
  title: string
  description: string
  coverImage?: string
  spotIds: string[]
  groupIds: string[]
}

export interface Filters {
  type: LocationType | ''
  district: string
  groupId: string
}

export interface MapViewport {
  center: { latitude: number; longitude: number }
  scale: number
}
