/**
 * Genera offline-package/: build de producción + servidor local para pruebas sin internet.
 */
import { spawnSync } from 'node:child_process'
import {
  cpSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'offline-package')
const appDir = join(outDir, 'app')

console.log('Construyendo Comandero para uso offline...\n')

const build = spawnSync('npm', ['run', 'build'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    VITE_SYNC_ENABLED: 'false',
    VITE_REPOSITORY_MODE: 'local',
    VITE_API_URL: '',
    VITE_API_KEY: '',
  },
})

if (build.status !== 0) {
  process.exit(build.status ?? 1)
}

rmSync(outDir, { recursive: true, force: true })
mkdirSync(appDir, { recursive: true })

cpSync(join(root, 'dist'), appDir, { recursive: true })

const serveScript = readFileSync(join(__dirname, 'serve-offline.mjs'), 'utf8')
const serveForPackage = serveScript.replace(
  "const APP_DIR = process.env.OFFLINE_APP_DIR ?? join(__dirname, '..', 'offline-package', 'app')",
  "const APP_DIR = process.env.OFFLINE_APP_DIR ?? join(__dirname, 'app')",
)
writeFileSync(join(outDir, 'serve.mjs'), serveForPackage)

writeFileSync(
  join(outDir, 'INICIAR.bat'),
  `@echo off
title Comandero
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo  Necesitas Node.js instalado: https://nodejs.org
  echo.
  pause
  exit /b 1
)
node serve.mjs
if errorlevel 1 (
  echo.
  pause
)
`,
)

writeFileSync(
  join(outDir, 'Comandero.vbs'),
  `Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = fso.GetParentFolderName(WScript.ScriptFullName)
shell.Run "cmd /c INICIAR.bat", 1, False
`,
)

writeFileSync(
  join(outDir, 'INICIAR.sh'),
  `#!/usr/bin/env sh
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "  Necesitas Node.js instalado: https://nodejs.org"
  echo ""
  exit 1
fi
node serve.mjs
`,
)

writeFileSync(
  join(outDir, 'LEEME.txt'),
  `COMANDERO — PAQUETE OFFLINE PARA PRUEBAS
======================================

Este paquete es una copia de la app lista para probar sin internet.
Los datos se guardan en el navegador de cada dispositivo (localStorage).

REQUISITOS
----------
- Node.js 22+ (solo para arrancar el servidor local)
- Tablet, móvil o PC con navegador moderno (Chrome, Edge, Safari)

ARRANQUE RÁPIDO (Windows)
--------------------------
1. Doble clic en INICIAR.bat (o Comandero.vbs)
2. Se abre el navegador automáticamente
3. En tablet/móvil: usa la URL "En la red WiFi" de la consola (misma WiFi que el PC)

ARRANQUE (Mac / Linux)
---------------------
1. chmod +x INICIAR.sh && ./INICIAR.sh
2. Abre la URL que aparece en la consola

INSTALAR COMO APP (PWA)
-----------------------
1. Abre la app en Chrome/Edge (no funciona con file://)
2. Menú → "Instalar aplicación" o el banner de instalación
3. Tras instalar, funciona sin conexión en ese dispositivo

PROBAR EN OTRO DISPOSITIVO
--------------------------
- PC y dispositivo deben estar en la misma red WiFi
- No hace falta internet, solo la red local
- Ejemplo: http://192.168.1.50:8080

REGENERAR ESTE PAQUETE
----------------------
Desde la carpeta del proyecto:
  npm run offline:build

NOTAS
-----
- La sincronización entre dispositivos está desactivada en este paquete
- Cada dispositivo tiene sus propios datos de prueba
- Puerto por defecto: 8080 (cambia con PORT=9000 node serve.mjs)
`,
)

console.log('\n✓ Paquete offline generado en: offline-package/')
console.log('  → Doble clic en offline-package/INICIAR.bat')
console.log('  → O ejecuta: npm run offline:serve\n')