const fs = require('fs')
const path = require('path')

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/--+/g, '-')
}

// Convert locations
const locationsRaw = JSON.parse(
  fs.readFileSync(
    '/Users/liyating/kpop-seoul-map/cloudfunctions/initDatabase/data/locations.json',
    'utf-8'
  )
)

const locations = locationsRaw.map((loc, i) => {
  // Generate ID from name if possible, otherwise use index
  const slug = slugify(loc.name) || `location-${i}`
  return {
    id: slug,
    ...loc,
  }
})

const locOutput = `// Auto-generated from locations.json — 172 Kpop Seoul locations
import type { Location } from '@/types'

export const locations: Location[] = ${JSON.stringify(locations, null, 2)}

export function getLocationById(id: string): Location | undefined {
  return locations.find(l => l.id === id)
}

export function getLocationsByGroup(groupName: string): Location[] {
  return locations.filter(l => l.groupNames.includes(groupName))
}

export function getLocationsByDistrict(district: string): Location[] {
  return locations.filter(l => l.location.district === district)
}

export function getLocationIds(): string[] {
  return locations.map(l => l.id)
}
`

fs.writeFileSync('/Users/liyating/kpop-seoul-web/src/lib/data/locations.ts', locOutput)
console.log(`Written ${locations.length} locations`)

// Convert groups
const groupsRaw = JSON.parse(
  fs.readFileSync(
    '/Users/liyating/kpop-seoul-map/cloudfunctions/initDatabase/data/groups.json',
    'utf-8'
  )
)

const groups = groupsRaw.map(g => ({
  id: slugify(g.name),
  ...g,
}))

const groupOutput = `// Auto-generated from groups.json — 31 Kpop groups
import type { Group } from '@/types'

export const groups: Group[] = ${JSON.stringify(groups, null, 2)}

export function getGroupById(id: string): Group | undefined {
  return groups.find(g => g.id === id)
}

export function getGroupByName(name: string): Group | undefined {
  return groups.find(g => g.name === name)
}

export function getGroupIds(): string[] {
  return groups.map(g => g.id)
}
`

fs.writeFileSync('/Users/liyating/kpop-seoul-web/src/lib/data/groups.ts', groupOutput)
console.log(`Written ${groups.length} groups`)

// Convert categories
const categoriesRaw = JSON.parse(
  fs.readFileSync(
    '/Users/liyating/kpop-seoul-map/cloudfunctions/initDatabase/data/categories.json',
    'utf-8'
  )
)

const catOutput = `// Categories for location classification
export const categories = ${JSON.stringify(categoriesRaw, null, 2)} as const

export type Category = (typeof categories)[number]['id']
`

fs.writeFileSync('/Users/liyating/kpop-seoul-web/src/lib/data/categories.ts', catOutput)
console.log(`Written ${categoriesRaw.length} categories`)

// Create guides from location data
const guides = [
  {
    id: 'hybe-tour',
    title: 'HYBE Labels Day Tour',
    description: 'Visit HYBE, nearby restaurants, and filming spots around Hannam-dong',
    spotIds: locations.filter(l =>
      l.groupNames.some(g => ['BTS', 'SEVENTEEN', 'TXT', 'ENHYPEN'].includes(g))
    ).slice(0, 8).map(l => slugify(l.name)),
    groupIds: ['bts', 'seventeen', 'txt', 'enha'],
  },
  {
    id: 'sm-town-tour',
    title: 'SM Entertainment World',
    description: 'Explore SM Town COEX, SM building, and nearby Kpop spots in Gangnam',
    spotIds: locations.filter(l =>
      l.groupNames.some(g => ['NCT 127', 'NCT DREAM', 'aespa', 'Red Velvet', 'EXO', 'RIIZE'].includes(g))
    ).slice(0, 8).map(l => slugify(l.name)),
    groupIds: ['nct-127', 'nct-dream', 'aespa', 'red-velvet', 'exo', 'riize'],
  },
  {
    id: 'hongdae-tour',
    title: 'Hongdae Kpop Street Tour',
    description: 'Album shops, idol restaurants, and dance studios in Hongdae area',
    spotIds: locations.filter(l =>
      l.location.district === '麻浦区' || l.location.neighborhood?.includes('弘大')
    ).slice(0, 8).map(l => slugify(l.name)),
    groupIds: [],
  },
  {
    id: 'seongsu-tour',
    title: 'Seongsu-dong Coffee & Kpop',
    description: 'Explore the trendiest neighborhood — cafes, pop-ups, and SM new building',
    spotIds: locations.filter(l =>
      l.location.district === '城东区' || l.location.neighborhood?.includes('圣水')
    ).slice(0, 8).map(l => slugify(l.name)),
    groupIds: ['nct-127', 'nct-dream', 'aespa'],
  },
  {
    id: 'myeongdong-shopping',
    title: 'Myeongdong Album Shopping',
    description: 'Best album shops and Kpop stores in Myeongdong',
    spotIds: locations.filter(l =>
      l.location.district === '中区' && (l.type === 'store' || l.type === 'restaurant')
    ).slice(0, 8).map(l => slugify(l.name)),
    groupIds: [],
  },
  {
    id: 'yg-tour',
    title: 'YG Family Tour — Mapo-gu',
    description: 'YG building, YG Place, and BLACKPINK/TREASURE favorite spots',
    spotIds: locations.filter(l =>
      l.groupNames.some(g => ['BLACKPINK', 'BIGBANG', 'TREASURE', 'BABYMONSTER'].includes(g))
    ).slice(0, 8).map(l => slugify(l.name)),
    groupIds: ['blackpink', 'bigbang', 'treasure', 'babymonster'],
  },
]

const guideOutput = `// Quick guides for Kpop fan itineraries
import type { Guide } from '@/types'

export const guides: Guide[] = ${JSON.stringify(guides, null, 2)}
`

fs.writeFileSync('/Users/liyating/kpop-seoul-web/src/lib/data/guides.ts', guideOutput)
console.log(`Written ${guides.length} guides`)

console.log('Data migration complete!')
