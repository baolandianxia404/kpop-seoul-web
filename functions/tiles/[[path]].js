export async function onRequest(context) {
  const [z, y, x] = context.params.path
  const arcgisUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`

  const cache = caches.default
  let res = await cache.match(context.request)
  if (!res) {
    res = await fetch(arcgisUrl)
    res = new Response(res.body, res)
    res.headers.set("Cache-Control", "public, max-age=604800, immutable")
    res.headers.set("Access-Control-Allow-Origin", "*")
    context.waitUntil(cache.put(context.request, res.clone()))
  }
  return res
}
