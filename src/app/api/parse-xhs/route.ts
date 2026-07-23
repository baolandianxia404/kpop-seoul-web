import { NextRequest, NextResponse } from "next/server"

// Domain whitelist to prevent SSRF abuse
const ALLOWED_DOMAINS = [
  "xiaohongshu.com",
  "www.xiaohongshu.com",
  "xhslink.com",
  "www.xhslink.com",
]

function isAllowedUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return ALLOWED_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d))
  } catch {
    return false
  }
}

// Extract Korean address patterns from text
const ADDRESS_PATTERNS = [
  // Korean: 서울특별시 XX구 XX동 XX로 XX길
  /(?:서울|부산|인천|대구|대전|광주|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)(?:\s*(?:특별시|광역시|특별자치시|특별자치도|시|도|군|구))?\s*(?:\S+(?:구|군|시|읍|면|동|가|로|길))\s*(?:\S+(?:동|가|로|길))?\s*(?:\d+(?:-\d+)?(?:\s*(?:번지|호|층))?)?/g,
  // Chinese: 首尔XX区XX洞XX号 / 首尔特别市
  /首尔(?:特别市|特别自治市)?\s*(?:\S+(?:区|洞|街|路))\s*(?:\S+(?:洞|街|路|号))?\s*(?:\d+(?:-\d+)?(?:号|楼|层))?/g,
  // General address with Korean postcode
  /(?:서울|Seoul)\s*.{2,}(?:구|gu|동|dong|로|ro|길|gil).{2,}(?:\d+(?:-\d+)?)/gi,
]

// Extract store/restaurant name patterns from XHS content
function extractStoreName(text: string): string | null {
  // Common XHS patterns for store names
  const patterns = [
    // "店名：XXX" or "店铺：XXX"
    /(?:店名|店铺|点名|店鋪)[:：]\s*(.+?)(?:[\n，。,.]|$)/,
    // "📍XXX" or "🏪XXX" emoji-prefixed names
    /(?:📍|🏪|🏬|🏢|🍽️|☕|🍜|🍰)\s*(.+?)(?:[\n，。,.]|$)/,
    // "地址：XXX" has more context, store name usually before it
    /(.+?)\s*(?:地址|위치|주소)[:：]/,
    // XHS note title format: "探店 | XXX" or "打卡 XXX"
    /(?:探店|打卡|推荐|방문|맛집)\s*[|｜]\s*(.+?)(?:[\n，。,.]|$)/,
    // Quoted names
    /[「「](.+?)[」」]/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]?.trim().length > 1) {
      return match[1].trim().slice(0, 60)
    }
  }

  return null
}

function extractAddress(text: string): string | null {
  for (const pattern of ADDRESS_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[0]?.trim().length > 4) {
      return match[0].trim().slice(0, 120)
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const url = body.url as string

    if (!url || !isAllowedUrl(url)) {
      return NextResponse.json(
        { success: false, error: "Invalid URL. Only Xiaohongshu links are supported." },
        { status: 400 }
      )
    }

    // Try to fetch with browser-like headers
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,ko;q=0.8,en;q=0.7",
        },
        redirect: "follow",
      })

      clearTimeout(timeout)

      if (!res.ok) {
        return NextResponse.json({
          success: false,
          error: `XHS returned ${res.status}. The note may require login.`,
        })
      }

      const html = await res.text()

      // Extract metadata from HTML
      const titleMatch = html.match(/<title>([^<]+)<\/title>/)
      const title = titleMatch
        ? titleMatch[1]
            .replace(/\s*[-–—|｜]\s*(?:小红书|RedNote|Xiaohongshu).*$/i, "")
            .trim()
        : null

      const ogTitleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/)
      const ogTitle = ogTitleMatch?.[1]?.trim() || null

      const descMatch = html.match(
        /<meta[^>]+name="(?:description|Description)"[^>]+content="([^"]+)"/
      )
      const metaDesc = descMatch?.[1]?.trim() || null

      const ogDescMatch = html.match(
        /<meta[^>]+property="og:description"[^>]+content="([^"]+)"/
      )
      const ogDesc = ogDescMatch?.[1]?.trim() || null

      const description = metaDesc || ogDesc || null
      const bestTitle = title || ogTitle || null

      // Try to extract address and store name from the full text
      // Strip HTML tags for text analysis
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim()

      const extractedAddress = extractAddress(textContent)
      const extractedStoreName = extractStoreName(textContent)

      // Build result
      const result: Record<string, string | null> = {
        title: extractedStoreName || bestTitle || null,
        address: extractedAddress || null,
        description: description?.slice(0, 300) || null,
      }

      return NextResponse.json({ success: true, data: result })
    } catch (fetchErr) {
      clearTimeout(timeout)
      return NextResponse.json({
        success: false,
        error: "Could not reach Xiaohongshu. The note may require login or the link is invalid.",
      })
    }
  } catch (err) {
    console.error("XHS parse error:", err)
    return NextResponse.json(
      { success: false, error: "Failed to parse link." },
      { status: 500 }
    )
  }
}
