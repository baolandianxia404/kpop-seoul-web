addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)
  if (!url.pathname.startsWith("/tiles/")) return // let Pages serve static files

  event.respondWith(
    (async () => {
      const [, , z, x, y] = url.pathname.split("/")
      const arcgisUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`

      const cache = caches.default
      let res = await cache.match(event.request)
      if (!res) {
        res = await fetch(arcgisUrl)
        res = new Response(res.body, res)
        res.headers.set("Cache-Control", "public, max-age=604800, immutable")
        res.headers.set("Access-Control-Allow-Origin", "*")
        event.waitUntil(cache.put(event.request, res.clone()))
      }
      return res
    })(),
  )
})
