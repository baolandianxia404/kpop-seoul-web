export interface FeaturedRoute {
  id: string
  emoji: string
  title: { en: string; zh: string }
  desc: { en: string; zh: string }
  color: string
  locationIds: string[]
}

export const FEATURED_ROUTES: FeaturedRoute[] = [
  {
    id: "sm-pilgrimage",
    emoji: "🏢",
    title: { en: "SM Entertainment Pilgrimage", zh: "SM 娱乐朝圣路线" },
    desc: {
      en: "KWANGYA → SM Building → SMTOWN COEX → COEX Mall",
      zh: "从 KWANGYA 出发，打卡 SM 大楼、COEX 手印墙、明星周边店",
    },
    color: "#ec4899",
    locationIds: [
      "kwangya-seoul",
      "sm",
      "sm-old-apgujeong",
      "sm-town-coex",
      "sm-hand-wall-coex",
      "coex-mall",
    ],
  },
  {
    id: "hongdae-cafe",
    emoji: "☕",
    title: { en: "Hongdae Idol Cafe Tour", zh: "弘大爱豆咖啡巡礼" },
    desc: {
      en: "Haru Coffee → Mouse Rabbit → Samee Cafe → Hongdae street",
      zh: "东海 Haru 咖啡 → 艺声 Mouse Rabbit → 弘大街头偶像周边店",
    },
    color: "#f59e0b",
    locationIds: [
      "haru-oneday",
      "mouse-rabbit-cafe",
      "samee-cafe",
      "yoajung-hongdae",
      "idolllook-hongdae",
    ],
  },
  {
    id: "mv-spots",
    emoji: "🎬",
    title: { en: "Iconic MV Film Spots", zh: "经典 MV 取景地" },
    desc: {
      en: "HYBE Insight → Namsan Tower → Banpo Bridge → Hangang Park",
      zh: "HYBE 博物馆 → 南山塔 → 盘浦大桥彩虹喷泉 → 汉江公园",
    },
    color: "#3b82f6",
    locationIds: [
      "hybe-insight",
      "bts-10",
      "location-60",
      "location-10",
    ],
  },
]
