import type { LocationTypeInfo, Preferences, Budget } from '@/types'

export const LOCATION_TYPES: Record<string, LocationTypeInfo> = {
  company: { name: 'Entertainment Company', icon: '🏢', color: '#7C3AED', tagClass: 'bg-purple-100 text-purple-700' },
  restaurant: { name: 'Idol Eats', icon: '🍽️', color: '#F59E0B', tagClass: 'bg-amber-100 text-amber-700' },
  mv_spot: { name: 'MV Filming Spot', icon: '🎬', color: '#3B82F6', tagClass: 'bg-blue-100 text-blue-700' },
  store: { name: 'Albums & Goods', icon: '🛍️', color: '#10B981', tagClass: 'bg-emerald-100 text-emerald-700' },
  entertainment: { name: 'Entertainment', icon: '🎡', color: '#EC4899', tagClass: 'bg-pink-100 text-pink-700' },
}

export const TYPE_NAME_CN: Record<string, string> = {
  company: '公司大楼',
  restaurant: '同款美食',
  mv_spot: 'MV拍摄地',
  store: '专辑/周边',
  entertainment: '娱乐景点',
}

export const DISTRICTS = [
  '龙山区', '江南区', '麻浦区', '中区', '钟路区',
  '永登浦区', '城东区', '广津区', '松坡区', '西大门区',
  '江东区', '铜雀区', '瑞草区', '京畿道', '仁川',
]

export const SEOUL_CENTER = { lat: 37.5665, lng: 126.9780 }

export const DEFAULT_ZOOM = 12
export const DETAIL_ZOOM = 15

export const DAY_OPTIONS = [1, 2, 3, 4, 5]

export const PREFERENCES_OPTIONS: { key: keyof Preferences; label: string; icon: string }[] = [
  { key: 'focusOnCompany', label: 'Company buildings', icon: '🏢' },
  { key: 'focusOnRestaurant', label: 'Idol restaurants', icon: '🍽️' },
  { key: 'focusOnMvSpot', label: 'MV filming spots', icon: '🎬' },
  { key: 'focusOnStore', label: 'Album & goods shops', icon: '🛍️' },
]

export const BUDGET_OPTIONS: { key: Budget; label: string; desc: string }[] = [
  { key: 'budget', label: 'Budget', desc: 'Public transport' },
  { key: 'medium', label: 'Comfortable', desc: 'Subway + taxi mix' },
  { key: 'luxury', label: 'Premium', desc: 'Mostly by taxi' },
]

export const PAGE_SIZE = 20
export const MAX_DAILY_GENERATIONS = 5
export const MAX_MAP_MARKERS = 80

export const ZOOM_TIERS = [
  { maxZoom: 11, types: ['company'] },
  { maxZoom: 13, types: ['company', 'entertainment', 'mv_spot'] },
  { maxZoom: 22, types: null },
] as const

export const MARKER_COLORS: Record<string, string> = {
  company: '#7C3AED',
  restaurant: '#F59E0B',
  mv_spot: '#3B82F6',
  store: '#10B981',
  entertainment: '#EC4899',
}
