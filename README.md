# Comandero

Aplicación web PWA para que **camareros tomen comandas** en tablets dentro de un restaurante. Gestión de mesas, menú con búsqueda, notas por plato, envío a cocina y cálculo de totales con IVA. Sincronización multi-dispositivo opcional vía API.

![CI](https://github.com/studerchali/comandero/actions/workflows/ci.yml/badge.svg)
![Version](https://img.shields.io/badge/version-v1.0.0-blue)

**Repositorio:** [github.com/studerchali/comandero](https://github.com/studerchali/comandero)

**Demo en vivo:** [comandero.vercel.app](https://comandero.vercel.app)

## Características

- Vista de **mesas** con estados: Libre, Ocupada, En cocina, Cuenta
- **Comanda** con categorías, búsqueda, artículos populares y notas rápidas
- **Enviar a cocina** con confirmación y tickets
- Vista **Cocina** con comandas activas
- Cálculo automático de **IVA 10% / 21%**
- **PWA instalable** con soporte offline
- Persistencia local + **sync opcional** con backend Fastify

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4
- Zustand (estado global)
- Fastify 5 (API de sincronización)
- lucide-react, Framer Motion, vite-plugin-pwa

## Requisitos

- Node.js 22+
- npm 10+

## Instalación

```bash
git clone <repo-url>
cd pda-app
npm install
cd server && npm install && cd ..
```

Copia variables de entorno:

```bash
cp .env.example .env
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Solo frontend (puerto 5173) |
| `npm run dev:server` | Solo API Fastify (puerto 3001) |
| `npm run dev:all` | Frontend + API en paralelo |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm run test` | Tests unitarios |
| `npm run test:coverage` | Tests con cobertura |
| `npm run lint` | Lint type-aware (Oxlint) |
| `npm run icons` | Regenerar iconos PWA |

## Sincronización (Fase 5)

1. En `.env`, activa sync:

```env
VITE_SYNC_ENABLED=true
VITE_API_URL=
```

`VITE_API_URL` vacío usa el proxy de Vite (`/api` → `localhost:3001`).

2. Arranca todo:

```bash
npm run dev:all
```

3. Abre la app en dos pestañas o dispositivos. Los cambios en mesas/comandas se sincronizan con debounce de 2 s.

4. En **Ajustes** puedes forzar sync manual o resolver conflictos.

### API (opcional en producción)

| Variable servidor | Descripción |
|-------------------|-------------|
| `PORT` | Puerto (default 3001) |
| `COMANDERO_API_KEY` | Si se define, exige cabecera `X-API-Key` |

Despliega `server/` en Render, Railway o similar. En el frontend de producción:

```env
VITE_SYNC_ENABLED=true
VITE_API_URL=https://tu-api.ejemplo.com
VITE_API_KEY=tu-clave
```

## Estructura

```
src/
├── components/   UI por dominio (mesas, comanda, cocina, PWA)
├── pages/        Páginas de ruta
├── routes/       React Router
├── layouts/      MainLayout, OrderLayout
├── services/     apiClient, syncManager
├── hooks/        useSync
├── ui/           Design system (Button, Input, Modal, Badge)
├── repositories/ LocalStorage + ApiRepository
├── i18n/         Mensajes en español
├── constants/    Configuración de app
├── store/        Zustand + persistencia
├── data/         Menú y mesas mock
├── types/        Tipos de dominio
└── utils/        Precios, formato

server/
└── src/          Fastify API + persistencia JSON
```

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles de capas y decisiones técnicas.

## PWA

La app es instalable en Android/iOS y funciona offline gracias al service worker generado en el build.

1. Ejecuta `npm run build && npm run preview`
2. Abre la URL en Chrome/Edge
3. Usa "Instalar aplicación" o el banner de instalación

## Despliegue

### Frontend — Vercel (recomendado)

```bash
npx vercel login
npx vercel --prod
```

Variables en Vercel: `VITE_SYNC_ENABLED`, `VITE_API_URL`, `VITE_API_KEY` (si aplica).

### Backend — Render / Railway

- Root: `server/`
- Build: `npm install`
- Start: `npm start`
- Añade `COMANDERO_API_KEY` en el panel del host

### CI automático

Secrets en GitHub → Settings → Secrets:

| Secret | Cómo obtenerlo |
|--------|----------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `npx vercel link` → `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` |

## Pruebas manuales

1. Abre una mesa → añade artículos con notas
2. Envía a cocina → comprueba ticket y vista Cocina
3. Con `dev:all`, abre segunda pestaña → verifica que los cambios aparecen
4. Recarga → las comandas persisten
5. Instala como PWA → funciona sin conexión (datos locales)

## Licencia

MIT