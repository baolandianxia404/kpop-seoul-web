// Tile proxy worker — fetches from CartoDB, caches on Cloudflare edge
// Deploy: cd workers/tile-proxy && npx wrangler deploy

const TILE_SOURCE = "https://a.basemaps.cartocdn.com/light_all";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Match /tiles/{z}/{x}/{y}.png
    const match = path.match(/^\/tiles\/(\d+)\/(\d+)\/(\d+)\.png$/);
    if (!match) {
      return new Response("Not found", { status: 404 });
    }

    const [, z, x, y] = match;
    const tileUrl = `${TILE_SOURCE}/${z}/${x}/${y}.png`;

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);
    if (response) return response;

    response = await fetch(tileUrl, {
      headers: { "User-Agent": "kpop-seoul-web tile proxy" },
    });

    if (!response.ok) {
      return new Response("Tile not available", { status: response.status });
    }

    // Clone and cache for 7 days
    const cached = new Response(response.body, response);
    cached.headers.set("Cache-Control", "public, max-age=604800, immutable");
    cached.headers.set("Access-Control-Allow-Origin", "*");
    ctx.waitUntil(cache.put(cacheKey, cached.clone()));

    return cached;
  },
};
