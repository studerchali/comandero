# Arquitectura — Comandero

## Visión general

Comandero es una PWA para tomar comandas en restaurantes. La arquitectura sigue capas claras con sincronización offline-first opcional (Fase 5).

```
┌─────────────────────────────────────────────────────────┐
│  Pages / Layouts / Components (React + Tailwind)        │
├─────────────────────────────────────────────────────────┤
│  React Router — navegación (/mesas, /cocina, /mesa/:id) │
├─────────────────────────────────────────────────────────┤
│  Zustand Store — estado de sesión + acciones de negocio │
├─────────────────────────────────────────────────────────┤
│  Sync Manager — pull/push debounced, conflictos         │
├─────────────────────────────────────────────────────────┤
│  Repository — persistencia (LocalStorage / API)         │
├─────────────────────────────────────────────────────────┤
│  Fastify API (server/) — estado compartido JSON         │
└─────────────────────────────────────────────────────────┘
```

## Estado global (Zustand)

**Decisión:** Zustand en lugar de Context API.

- Selectores granulares → menos re-renders en tablets
- Middleware `persist` con storage abstracto
- Sin providers anidados

**Persistido** (vía repositorio): `tables`, `orders`, `kitchenTickets`

**Efímero** (solo memoria): categoría activa, búsqueda, modal de artículo, confirmación de envío, `syncStatus`

## Sincronización (Fase 5)

Flujo **offline-first**:

1. Cambios locales → `localStorage` inmediato (Zustand persist)
2. `useSync` observa el store y programa `push` con debounce de 2 s
3. Al arrancar → `pull` del servidor; si `updatedAt` remoto es mayor, aplica estado
4. Conflictos (409) → UI en Ajustes para elegir servidor o forzar local

| Variable | Descripción |
|----------|-------------|
| `VITE_SYNC_ENABLED` | Activa sync (`true` / omitir) |
| `VITE_API_URL` | URL base API (vacío = proxy Vite `/api`) |
| `VITE_API_KEY` | Cabecera `X-API-Key` si el servidor la exige |

Meta de sync en `localStorage` (`comandero-sync-meta-v1`): `clientId`, `updatedAt`, `lastSyncedAt`.

## Capa de repositorio

| Implementación | Uso |
|----------------|-----|
| `LocalStorageRepository` | Producción por defecto |
| `ApiRepository` | Persistencia directa vía API (`VITE_REPOSITORY_MODE=api`) |

```ts
interface RestaurantRepository {
  load(): PersistedRestaurantState | null
  save(state: PersistedRestaurantState): void
  clear(): void
}
```

El store usa `createRepositoryStorage()` como adaptador para `zustand/persist`.

## Backend (`server/`)

Fastify en puerto 3001:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/restaurant/state` | Estado completo |
| PUT | `/api/restaurant/state` | Upsert con control `updatedAt` |
| DELETE | `/api/restaurant/state` | Reset |

Persistencia en `server/data/restaurant-state.json`. API key opcional vía `COMANDERO_API_KEY`.

## Routing

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/mesas` | TablesPage | Grid de mesas |
| `/mesa/:tableId` | OrderPage | Comanda activa |
| `/cocina` | KitchenPage | Tickets enviados |
| `/ajustes` | SettingsPage | Sync, reset, info |

## Design system (`src/ui/`)

Componentes reutilizables sin lógica de negocio:

- `Button` — botones táctiles (48–64px)
- `Input` — campos con label y error
- `Badge` — estados de mesa y sync
- `Modal` — diálogos con animación Framer Motion

## Internacionalización

Mensajes centralizados en `src/i18n/messages.ts` (español hostelería).

Constantes de app en `src/constants/`.

## PWA

- `vite-plugin-pwa` genera SW + manifest en build
- Registro en `src/pwa.ts`
- Precache de assets estáticos

## Storybook

**Diferido:** Storybook 8 no soporta Vite 8 aún.

## Próximos pasos

1. Autenticación de camareros / multi-restaurante
2. WebSocket para cocina en tiempo real
3. Base de datos (PostgreSQL) en lugar de JSON