const sharp = require("sharp")
const path = require("path")
const fs = require("fs")

const PUBLIC = path.join(__dirname, "..", "public")
const svg = fs.readFileSync(path.join(PUBLIC, "icon.svg"))

const sizes = [
  { file: "favicon-48.png", size: 48 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
]

async function main() {
  for (const { file, size } of sizes) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(PUBLIC, file))
    console.log(`Created ${file} (${size}x${size})`)
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
