// Cloudflare Pages Function — proxy URL fetch to extract page metadata
// Handles XHS short links (xhslink.cn) by following redirects to get the full page title

export async function onRequest(context: { request: Request }) {
  const url = new URL(context.request.url).searchParams.get("url")
  if (!url) return json({ error: "Missing url param" }, 400)

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return json({ error: "Invalid URL" }, 400)
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return json({ error: "Only http/https allowed" }, 400)
  }

  try {
    // First hop: follow redirects (xhslink.cn → xiaohongshu.com)
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,ko;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    })

    const finalUrl = res.url
    const html = await res.text()

    // Extract the note title from <title> (XHS puts note title here for SEO)
    const rawTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || ""
    // XHS title format: "NoteTitle - 小红书" or "NoteTitle"
    const title = cleanText(rawTitle.replace(/\s*[-–—|]\s*(小红书|xiao?hongshu|RED).*$/i, ""))

    // Try to get meta description
    const getMeta = (name: string) => {
      const r = new RegExp(
        `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
        "i"
      )
      return html.match(r)?.[1] || ""
    }
    const description = getMeta("og:description") || getMeta("description") || ""

    // Try embedded JSON-LD or __NEXT_DATA__ style data
    let embeddedTitle: string | null = null
    let embeddedDesc: string | null = null
    let embeddedAddress: string | null = null

    // Try JSON-LD
    const ldMatch = html.match(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
    )
    if (ldMatch) {
      try {
        const ld = JSON.parse(ldMatch[1])
        embeddedTitle = ld.name || ld.headline || null
        embeddedDesc = ld.description || null
        if (ld.location?.address) {
          embeddedAddress =
            ld.location.address.streetAddress ||
            ld.location.address.addressLocality ||
            ld.location.name ||
            null
        }
      } catch {}
    }

    // Try to find note content in script data (XHS sometimes embeds note data)
    const noteDataMatch = html.match(
      /"noteTitle"\s*:\s*"([^"]+)"/i
    )
    if (noteDataMatch && !embeddedTitle) {
      embeddedTitle = cleanText(noteDataMatch[1])
    }

    // Extract address from full HTML text
    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&\w+;/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 15000)
    const possibleAddress = extractKoreanAddress(textContent)

    // Best title: embedded > og > html title
    const bestTitle = embeddedTitle || title || ""
    const bestDesc = embeddedDesc || description || ""

    return json({
      title: bestTitle.slice(0, 200),
      description: bestDesc.slice(0, 500),
      siteName: "xiaohongshu",
      possibleAddress: embeddedAddress || possibleAddress,
      sourceUrl: finalUrl,
      isXhs: /xiaohongshu|xhslink/.test(finalUrl),
    })
  } catch (err) {
    return json({ error: "Fetch failed: " + (err instanceof Error ? err.message : "") }, 502)
  }
}

function cleanText(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#[xX]?\w+;/g, "")
    .replace(/&\w+;/g, "")
    .trim()
}

function extractKoreanAddress(text: string): string | null {
  const patterns = [
    /(?:서울|부산|인천|대구|대전|광주|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s*\S*?(?:특별시|광역시|시|도)?\s+\S{2,}[구군]\s+\S{2,}[동읍면리]?\s*(?:\S*[로길가]\s*)?\d*(?:[번\-]\d*)?(?:호|층)?/g,
    /\S{2,}[구군]\s+\S{2,}[동읍면리]?\s*(?:\S*[로길가]\s*)?\d+(?:[번\-]\d+)?(?:호|층)?/g,
    /首尔(?:特别市|特别自治市)?\s*\S{2,}[区洞街路]\s*\S{2,}[洞街路号]?\s*\d*(?:-\d+)?(?:号|楼|层)?/g,
    /(?:地址|위치|주소|위치정보|장소)[:：]\s*(.+?)(?:[\n，。,.]|$)/gi,
    /\S{2,}[로길]\s+\d+(?:[번\-]\d+)?(?:호|층)?/g,
    /\S{2,}[동]\s+\d+(?:[번\-]\d+)?/g,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const addr = m[0].trim()
      if (addr.length > 5 && addr.length < 120) return addr
    }
  }
  return null
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
