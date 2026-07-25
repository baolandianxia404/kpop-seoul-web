"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { locations } from "@/lib/data/locations"
import { groups } from "@/lib/data/groups"
import { createClient } from "@/lib/supabase/client"
import { useLang } from "@/components/LanguageProvider"

const FUN_FACTS = [
  {
    emoji: "🏢",
    zh: "HYBE 大楼前身是 BigHit 租的小办公室，BTS 练习生时期在地下室度过。",
    en: "HYBE started as a tiny BigHit office — BTS trainees spent years in the basement.",
    locationId: "hybe-insight",
  },
  {
    emoji: "☕",
    zh: "SJ 东海开的 Haru 咖啡厅，菜单上的「东海拿铁」是他自己调配的配方。",
    en: "Super Junior Donghae's Haru Coffee has a 'Donghae Latte' he created himself.",
    locationId: "haru-oneday",
  },
  {
    emoji: "🎤",
    zh: "首尔 KSPO Dome 的前身是体操竞技场，从 H.O.T 到 BTS 都在这里开过演唱会。",
    en: "KSPO Dome was originally a gymnastics arena — from H.O.T to BTS, legends performed here.",
    locationId: "kspo-dome",
  },
  {
    emoji: "🎬",
    zh: "三清洞的韩屋咖啡厅是 MV 拍摄热门地，TWICE、IU、Red Velvet 都曾在此取景。",
    en: "Samcheong-dong's hanok cafes are MV hotspots — TWICE and Red Velvet filmed here.",
    locationId: "location-59",
  },
  {
    emoji: "🏪",
    zh: "KWANGYA 的名字来自 SM 的世界观「光野」，店里藏着 aespa 虚拟世界的入口彩蛋。",
    en: "KWANGYA is named after SM's universe concept — look for aespa virtual world easter eggs inside.",
    locationId: "kwangya-seoul",
  },
  {
    emoji: "🚇",
    zh: "弘益大学站 9 号出口是粉丝文化圣地，每逢回归期墙面贴满偶像庆生广告。",
    en: "Hongik Univ. Station Exit 9 is fandom holy ground — walls are covered with birthday ads during comebacks.",
    locationId: "yoajung-hongdae",
  },
  {
    emoji: "🎵",
    zh: "汝矣岛汉江公园是《Spring Day》《Dynamite》等多首 MV 的隐藏取景地。",
    en: "Yeouido Hangang Park appears in 'Spring Day', 'Dynamite' and more iconic MVs.",
    locationId: "location-10",
  },
  {
    emoji: "🌟",
    zh: "COEX 的 SM 艺人手印墙里，EXO 成员的手印被摸得最亮 — 粉丝说能蹭到好运。",
    en: "At COEX's SM handprint wall, EXO's prints are the shiniest — fans believe touching them brings luck.",
    locationId: "sm-hand-wall-coex",
  },
]

const CHALLENGES = [
  { emoji: "🎲", zh: "随机抛出一个追星地，走到哪算哪！", en: "Random spot roulette — go where fate takes you!" },
  { emoji: "🚶", zh: "今天去离你最近的一个打卡地朝圣。", en: "Visit the Kpop spot closest to you today." },
  { emoji: "📸", zh: "模仿你本命的 MV pose，在取景地拍一张同款。", en: "Recreate your bias's MV pose at a filming location." },
  { emoji: "☕", zh: "去一家爱豆开的咖啡厅，点一杯偶像同款饮品。", en: "Visit an idol-owned cafe and order their signature drink." },
  { emoji: "🛍", zh: "逛一家专辑店，看看能不能淘到绝版小卡。", en: "Hit up an album shop — you might find a rare photocard." },
  { emoji: "🎤", zh: "在 Karaoke 唱一首本命的歌，录下来发到小屋。", en: "Sing your bias's song at karaoke and post it in the House." },
]

type CardType = "fact" | "challenge" | "checkin"

export default function DiscoveryCard() {
  const { lang } = useLang()
  const [cardType, setCardType] = useState<CardType>("fact")
  const [factIndex, setFactIndex] = useState(0)
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [featuredCheckin, setFeaturedCheckin] = useState<{
    user_name: string
    spot_name: string
    content: string
    group_name: string
    group_id: string
  } | null>(null)

  useEffect(() => {
    setMounted(true)
    // Randomly pick card type for this session
    const types: CardType[] = ["fact", "challenge", "checkin"]
    const hash = Math.floor(Date.now() / 3600000) // changes every hour
    setCardType(types[hash % 3])
    setFactIndex(hash % FUN_FACTS.length)
    setChallengeIndex(hash % CHALLENGES.length)

    // Try fetching a featured checkin
    const supabase = createClient()
    supabase
      .from("check_ins")
      .select("id, user_id, group_id, spot_name, content")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Pick one with content
          const withContent = (data as { id: string; user_id: string; group_id: string; spot_name: string; content: string }[]).filter(
            (c) => c.content && c.content.length > 10
          )
          const pick = withContent.length > 0
            ? withContent[hash % withContent.length]
            : (data as { id: string; user_id: string; group_id: string; spot_name: string; content: string }[])[0]

          if (pick) {
            supabase
              .from("profiles")
              .select("display_name")
              .eq("id", pick.user_id)
              .single()
              .then(({ data: profile }) => {
                const group = groups.find((g) => g.id === pick.group_id)
                setFeaturedCheckin({
                  user_name: (profile as { display_name: string } | null)?.display_name || "匿名粉丝",
                  spot_name: pick.spot_name,
                  content: pick.content,
                  group_name: group?.name || pick.group_id,
                  group_id: pick.group_id,
                })
              })
          }
        }
      })
  }, [])

  if (!mounted) return null

  const fact = FUN_FACTS[factIndex]
  const challenge = CHALLENGES[challengeIndex]
  const factLoc = locations.find((l) => l.id === fact.locationId)

  const cards = {
    fact: {
      emoji: "💡",
      label: { zh: "追星冷知识", en: "Kpop Fun Fact" },
      color: "#8b5cf6",
      bg: "from-purple-50 to-violet-50",
      border: "border-purple-200",
    },
    challenge: {
      emoji: "🎲",
      label: { zh: "今日追星挑战", en: "Daily Challenge" },
      color: "#f59e0b",
      bg: "from-amber-50 to-yellow-50",
      border: "border-amber-200",
    },
    checkin: {
      emoji: "📸",
      label: { zh: "粉丝精选打卡", en: "Featured Check-in" },
      color: "#ec4899",
      bg: "from-pink-50 to-rose-50",
      border: "border-pink-200",
    },
  }

  const currentCard = cards[cardType]

  return (
    <div className="mb-8">
      <h2 className="text-center text-sm font-black text-slate-700 mb-4 flex items-center justify-center gap-2">
        <span className="animate-sparkle">{currentCard.emoji}</span>
        {currentCard.label[lang]}
        <span className="animate-sparkle" style={{ animationDelay: "1s" }}>{currentCard.emoji}</span>
      </h2>

      <div className={`max-w-lg mx-auto bg-gradient-to-br ${currentCard.bg} rounded-2xl border-2 ${currentCard.border} overflow-hidden`}>
        {cardType === "fact" && (
          <div className="p-5">
            <p className="text-sm text-slate-700 leading-relaxed mb-3">{fact[lang]}</p>
            {factLoc && (
              <Link
                href={`/locations/${fact.locationId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{ backgroundColor: currentCard.color }}
              >
                📍 {lang === "zh" ? "去看看" : "See the spot"} → {factLoc.name}
              </Link>
            )}
          </div>
        )}

        {cardType === "challenge" && (
          <div className="p-5">
            <p className="text-sm text-slate-700 leading-relaxed mb-3">{challenge[lang]}</p>
            <div className="flex items-center gap-2">
              <Link
                href="/locations"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{ backgroundColor: currentCard.color }}
              >
                📍 {lang === "zh" ? "去探索地点" : "Explore spots"}
              </Link>
              <button
                onClick={() => setChallengeIndex((challengeIndex + 1) % CHALLENGES.length)}
                className="text-xs font-mono text-slate-400 hover:text-amber-500 px-3 py-2 rounded-xl border border-slate-200 hover:border-amber-300 transition"
              >
                🔄 {lang === "zh" ? "换一个" : "Shuffle"}
              </button>
            </div>
          </div>
        )}

        {cardType === "checkin" && featuredCheckin && (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-pink-200 flex items-center justify-center text-xs font-bold text-pink-600">
                {featuredCheckin.user_name.slice(0, 1)}
              </div>
              <span className="text-xs font-semibold text-slate-600">{featuredCheckin.user_name}</span>
              <span className="text-[10px] text-pink-400 font-mono">{featuredCheckin.group_name}</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mb-2">
              「{featuredCheckin.spot_name}」{featuredCheckin.content.length > 80
                ? featuredCheckin.content.slice(0, 80) + "..."
                : featuredCheckin.content}
            </p>
            <Link
              href={`/groups/${featuredCheckin.group_id}/house`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition-all hover:scale-105"
              style={{ backgroundColor: currentCard.color }}
            >
              🏠 {lang === "zh" ? "去小屋看更多" : "Visit House"}
            </Link>
          </div>
        )}

        {cardType === "checkin" && !featuredCheckin && (
          <div className="p-5 text-center">
            <p className="text-sm text-slate-400">
              {lang === "zh" ? "还没有粉丝打卡，来做第一个吧！" : "No check-ins yet — be the first!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
