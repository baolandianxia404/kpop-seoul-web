// Cloudflare Pages Function — proxy URL fetch to extract page metadata
// Works around CORS so the browser can retrieve title/description from any URL
interface Env {
  // no bindings needed
}

export async function onRequest(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url).searchParams.get("url")
  if (!url) {
    return json({ error: "Missing url param" }, 400)
  }

  // Basic URL validation
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
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; KpopSeoulMap/1.0; +https://kpopseoulmap.com)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "zh-CN,zh;q=0.9,ko;q=0.8,en;q=0.7",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    })

    const html = await res.text()

    // Extract metadata from HTML
    const getMeta = (name: string) => {
      const r = new RegExp(
        `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
        "i"
      )
      return html.match(r)?.[1] || ""
    }

    const title =
      getMeta("og:title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      ""
    const description =
      getMeta("og:description") || getMeta("description") || ""
    const siteName = getMeta("og:site_name") || ""

    // Try to extract Korean/Chinese address from visible text
    const textContent = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 8000)
    const possibleAddress = extractAddress(textContent)

    return json({
      title: cleanText(title).slice(0, 200),
      description: cleanText(description).slice(0, 500),
      siteName: cleanText(siteName),
      possibleAddress,
      sourceUrl: res.url,
    })
  } catch {
    return json({ error: "Fetch failed" }, 502)
  }
}

function cleanText(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&\w+;/g, "")
    .trim()
}

function extractAddress(text: string): string | null {
  const patterns = [
    // Korean addresses
    /(?:서울|부산|인천|대구|대전|광주|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s*\S*?(?:특별시|광역시|시|도)?\s+\S+[구군]\s+\S+[동읍면리]\s*(?:\S+[로길가]\s*)?\d*(?:[번\-]\d*)?(?:호|층)?/g,
    /\S{2,}[구군]\s+\S{2,}[동읍면리가로길]\s*\d*(?:[번\-]\d*)?(?:호|층)?/g,
    // Chinese addresses (for XHS content)
    /首尔(?:特别市|特别自治市)?\s*\S{2,}[区洞街路]\s*\S{2,}[洞街路号]?\s*\d*(?:-\d+)?(?:号|楼|层)?/g,
    /(?:地址|위치|주소)[:：]\s*(.+?)(?:[\n，。,.]|$)/gi,
  ]
  for (const p of patterns) {
    const matches = text.matchAll(new RegExp(p.source, p.flags))
    for (const m of matches) {
      const addr = (m[1] || m[0]).trim()
      if (addr.length > 4 && addr.length < 120) return addr
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
