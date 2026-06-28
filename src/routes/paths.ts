export const paths = {
  home: '/',
  tables: '/mesas',
  kitchen: '/cocina',
  settings: '/ajustes',
  table: (id: string) => `/mesa/${id}`,
} as const