/**
 * Servidor HTTP mínimo para probar la PWA offline en red local.
 * Sin dependencias externas — solo Node.js.
 */
import { createServer } from 'node:http'
import { exec } from 'node:child_process'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, normalize } from 'node:path'
import { networkInterfaces, platform } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_DIR = process.env.OFFLINE_APP_DIR ?? join(__dirname, '..', 'offline-package', 'app')
const PORT = Number(process.env.PORT ?? 8080)
const HOST = process.env.HOST ?? '0.0.0.0'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

function openBrowser(url) {
  if (process.env.OPEN_BROWSER === 'false') return

  const cmd =
    platform() === 'win32'
      ? `start "" "${url}"`
      : platform() === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`

  exec(cmd, (error) => {
    if (error) console.log(`  No se pudo abrir el navegador. Abre manualmente: ${url}`)
  })
}

function localAddresses() {
  const ips = []
  for (const iface of Object.values(networkInterfaces())) {
    if (!iface) continue
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ips.push(addr.address)
      }
    }
  }
  return ips
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' })
  res.end(body)
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  const resolved = normalize(join(APP_DIR, decoded))
  if (!resolved.startsWith(normalize(APP_DIR))) return null
  return resolved
}

const server = createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url
  let filePath = safePath(urlPath)

  if (!filePath || !existsSync(filePath)) {
    filePath = join(APP_DIR, 'index.html')
  } else if (statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html')
  }

  if (!existsSync(filePath)) {
    return send(res, 404, 'No encontrado')
  }

  const ext = extname(filePath)
  const type = MIME[ext] ?? 'application/octet-stream'

  try {
    const data = readFileSync(filePath)
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
    })
    res.end(data)
  } catch {
    send(res, 500, 'Error al leer archivo')
  }
})

server.listen(PORT, HOST, () => {
  const localUrl = `http://localhost:${PORT}`

  console.log('')
  console.log('  Comandero — modo offline')
  console.log('  ─────────────────────────')
  console.log(`  Carpeta: ${APP_DIR}`)
  console.log('')
  console.log(`  En este PC:     ${localUrl}`)
  for (const ip of localAddresses()) {
    console.log(`  En la red WiFi: http://${ip}:${PORT}`)
  }
  console.log('')
  console.log('  Abriendo navegador...')
  console.log('  Cierra esta ventana para detener el servidor.')
  console.log('')

  openBrowser(localUrl)
})