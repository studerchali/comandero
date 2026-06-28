# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el versionado [SemVer](https://semver.org/lang/es/).

## [1.0.0] - 2026-06-28

Primera versión estable de **Comandero**, PWA para tomar comandas en restaurantes.

### Añadido

- Vista de **mesas** con estados: Libre, Ocupada, En cocina, Cuenta
- **Comanda** con categorías, búsqueda, artículos populares y notas por plato
- Envío a **cocina** con confirmación y tickets
- Vista **Cocina** con comandas activas
- Cálculo automático de IVA (10% / 21%)
- **PWA instalable** con soporte offline (service worker)
- Persistencia local con Zustand + localStorage
- **Sincronización multi-dispositivo** opcional vía API Fastify
- Resolución de conflictos de sync en Ajustes
- Paquete offline para pruebas locales (`npm run offline`)
- CI con lint, tests y build (GitHub Actions)
- Workflow de despliegue opcional a Vercel

### Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4
- Zustand
- Fastify 5 (API de sincronización)
- Vitest + Testing Library

### Seguridad

- Variables sensibles en `.env` (excluidas del repositorio)
- API key opcional en backend (`COMANDERO_API_KEY`)
- Datos de runtime del servidor excluidos (`server/data/`)

[1.0.0]: https://github.com/studerchali/comandero/releases/tag/v1.0.0