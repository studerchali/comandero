import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const svg = readFileSync(join(publicDir, 'pwa-icon.svg'))

const sizes = [192, 512]

for (const size of sizes) {
  const buffer = await sharp(svg).resize(size, size).png().toBuffer()
  writeFileSync(join(publicDir, `pwa-${size}x${size}.png`), buffer)
  console.log(`Generated pwa-${size}x${size}.png`)
}

// Maskable icon with safe padding
const maskable = await sharp(svg)
  .resize(410, 410)
  .extend({
    top: 51,
    bottom: 51,
    left: 51,
    right: 51,
    background: { r: 20, g: 17, b: 15, alpha: 1 },
  })
  .png()
  .toBuffer()

writeFileSync(join(publicDir, 'pwa-maskable-512x512.png'), maskable)
console.log('Generated pwa-maskable-512x512.png')