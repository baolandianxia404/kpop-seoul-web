import { NextRequest, NextResponse } from "next/server"

const ALLOWED_DOMAINS = [
  "xiaohongshu.com", "www.xiaohongshu.com",
  "xhslink.com", "www.xhslink.com",
  "xhslink.cn", "www.xhslink.cn",
]

function isAllowedUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return ALLOWED_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d))
  } catch { return false }
}

// Extract title and description from XHS share format:
// 【Title】Description text... http://xhslink.cn/xxx 【小红书】里有答案，快去围观~
export function parseXhsShareText(input: string): {
  url: string | null
  title: string | null
  snippet: string | null
  isShareText: boolean
} {
  // Pattern: 【...】 or [...] followed by description and URL
  const sharePattern = /【(.+?)】\s*(.+?)?\s*(https?:\/\/[^\s]+)/;
  const match = input.match(sharePattern);

  if (match) {
    return {
      title: match[1].trim(),
      snippet: (match[2] || "").replace(/【小红书】里有答案.*$/, "").trim(),
      url: match[3],
      isShareText: true,
    };
  }

  // Try another format: plain text followed by URL
  const altPattern = /(.+?)\s+(https?:\/\/[^\s]+)/;
  const altMatch = input.match(altPattern);
  if (altMatch) {
    return {
      title: altMatch[1].replace(/【小红书】里有答案.*$/, "").trim().slice(0, 80),
      snippet: null,
      url: altMatch[2],
      isShareText: true,
    };
  }

  return { url: null, title: null, snippet: null, isShareText: false };
}

// Extract possible address from text snippets
export function extractAddress(text: string): string | null {
  const patterns = [
    // Korean full address
    /(?:서울|부산|인천|대구|대전|광주|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\s*\S*?(?:특별시|광역시|시|도)?\s+\S+[구군]\s+\S+[동읍면리]\s*(?:\S+[로길가]\s*)?\d*(?:[번\-]\d*)?(?:호|층)?/g,
    // Short form: XX구 XX동
    /\S{2,}[구군]\s+\S{2,}[동읍면리가로길]\s*\d*(?:[번\-]\d*)?(?:호|층)?/g,
    // Chinese: 首尔XX区XX洞
    /首尔(?:特别市|特别自治市)?\s*\S{2,}[区洞街路]\s*\S{2,}[洞街路号]?\s*\d*(?:-\d+)?(?:号|楼|层)?/g,
    // Address prefixed
    /(?:地址|위치|주소|서울|首尔)[:：]\s*(.+?)(?:[\n，。,.]|$)/gi,
    // General: contains dong/ro/gil with numbers
    /\S+(?:동|로|길|가)\s*\d+(?:[번\-]\d*)?(?:호|층)?/g,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches?.length) {
      const best = matches.find((m) => m.length > 4 && m.length < 120);
      if (best) return best.trim();
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = (body.text as string) || (body.url as string) || "";

    if (!input) {
      return NextResponse.json({ success: false, error: "No input provided." }, { status: 400 });
    }

    // Step 1: Parse XHS share text format
    const parsed = parseXhsShareText(input);
    let title = parsed.title;
    let snippet = parsed.snippet;
    let address: string | null = null;
    let description: string | null = null;
    const url = parsed.url || (body.url as string) || null;

    // Step 2: If we got share text, extract address from the snippet
    if (parsed.isShareText && snippet) {
      address = extractAddress(snippet);
    }

    // Step 3: Try to fetch the URL if available and we don't have enough info
    if (url && isAllowedUrl(url) && !address) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "zh-CN,zh;q=0.9,ko;q=0.8",
          },
          redirect: "follow",
        });
        clearTimeout(timeout);

        if (res.ok) {
          const html = await res.text();
          const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/\s+/g, " ")
            .trim();

          address = extractAddress(textContent);

          if (!title) {
            const titleMatch = html.match(/<title>([^<]+)<\/title>/);
            if (titleMatch) {
              title = titleMatch[1].replace(/\s*[-–—|｜]\s*(?:小红书|RedNote).*$/i, "").trim();
            }
          }

          const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/);
          description = descMatch?.[1]?.slice(0, 200) || null;
        }
      } catch {
        // Fetch failed, that's fine - we have share text data
      }
    }

    // Step 4: If input is just text (no URL), extract what we can
    if (!parsed.isShareText && !url) {
      title = title || input.slice(0, 80);
      address = extractAddress(input);
    }

    return NextResponse.json({
      success: true,
      data: {
        title: title?.slice(0, 80) || null,
        address: address?.slice(0, 150) || null,
        description: description || snippet?.slice(0, 200) || null,
        url: url || null,
        isShareText: parsed.isShareText,
      },
    });
  } catch (err) {
    console.error("XHS parse error:", err);
    return NextResponse.json({ success: false, error: "Failed to parse." }, { status: 500 });
  }
}
