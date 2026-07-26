/**
 * Transform Supabase Storage public URL to use image resizing.
 * Uses Supabase Storage image transformation: transforms object URL to render URL.
 */
export function getOptimizedImageUrl(url: string, width = 400): string {
  // URL format: https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  // Transform: https://<ref>.supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=400&resize=cover
  try {
    const u = new URL(url)
    u.pathname = u.pathname.replace("/object/public/", "/render/image/public/")
    u.searchParams.set("width", String(width))
    u.searchParams.set("resize", "cover")
    return u.toString()
  } catch {
    return url
  }
}
