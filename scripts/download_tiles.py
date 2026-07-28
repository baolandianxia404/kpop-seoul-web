#!/usr/bin/env python3
"""Download ArcGIS tiles for Seoul area. Run ONCE with VPN, then deploy.
Usage: python3 scripts/download_tiles.py
Output: public/tiles/{z}/{x}/{y}.jpg
"""

import os
import urllib.request
import time
import math

# Seoul bounds + margin
LAT_MIN, LAT_MAX = 37.40, 37.72
LNG_MIN, LNG_MAX = 126.75, 127.20

ZOOM_MIN, ZOOM_MAX = 10, 16

TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "tiles")


def latlon_to_tile(lat, lng, z):
    """Convert lat/lng to tile x/y at zoom z."""
    n = 2**z
    x = int((lng + 180.0) / 360.0 * n)
    y = int((1.0 - math.log(math.tan(math.radians(lat)) + 1.0 / math.cos(math.radians(lat))) / math.pi) / 2.0 * n)
    return x, y


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    total = 0
    downloaded = 0

    for z in range(ZOOM_MIN, ZOOM_MAX + 1):
        x_min, y_max = latlon_to_tile(LAT_MIN, LNG_MIN, z)
        x_max, y_min = latlon_to_tile(LAT_MAX, LNG_MAX, z)

        count = (x_max - x_min + 1) * (y_max - y_min + 1)
        total += count
        print(f"Zoom {z}: {x_min}..{x_max} x {y_min}..{y_max} = {count} tiles")

        for x in range(x_min, x_max + 1):
            for y in range(y_min, y_max + 1):
                out_path = os.path.join(OUTPUT_DIR, str(z), str(x), f"{y}.jpg")
                if os.path.exists(out_path):
                    downloaded += 1
                    continue

                os.makedirs(os.path.dirname(out_path), exist_ok=True)

                url = TILE_URL.format(z=z, x=x, y=y)
                success = False
                for attempt in range(3):
                    try:
                        req = urllib.request.Request(url, headers={"User-Agent": "kpop-tile-downloader"})
                        with urllib.request.urlopen(req, timeout=15) as resp:
                            if resp.status == 200:
                                with open(out_path, "wb") as f:
                                    f.write(resp.read())
                                downloaded += 1
                                success = True
                            else:
                                print(f"  HTTP {resp.status}: {url}")
                        break
                    except Exception as e:
                        if attempt < 2:
                            time.sleep(1)
                        else:
                            print(f"  FAIL: {url} — {e}")

                time.sleep(0.05)  # Be polite to the server

    print(f"\nDone! {downloaded}/{total} tiles saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
