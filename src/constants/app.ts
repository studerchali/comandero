export const APP_NAME = 'Comandero'
export const APP_TAGLINE = 'TPV Camarero para restaurantes'
export const APP_VERSION = '0.5.0'

export type RepositoryMode = 'local' | 'api'

export const REPOSITORY_MODE: RepositoryMode =
  (import.meta.env.VITE_REPOSITORY_MODE as RepositoryMode) ?? 'local'

export const SYNC_ENABLED = import.meta.env.VITE_SYNC_ENABLED === 'true'
export const API_URL = import.meta.env.VITE_API_URL ?? ''
export const API_KEY = import.meta.env.VITE_API_KEY ?? ''