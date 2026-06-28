import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PersistedState, SyncPayload } from './validation.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const STATE_FILE = join(DATA_DIR, 'restaurant-state.json')

export interface StoredRecord {
  state: PersistedState
  updatedAt: string
  clientId: string
}

export async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
}

export async function readRecord(): Promise<StoredRecord | null> {
  try {
    const raw = await readFile(STATE_FILE, 'utf-8')
    return JSON.parse(raw) as StoredRecord
  } catch {
    return null
  }
}

export async function writeRecord(record: StoredRecord): Promise<void> {
  await ensureDataDir()
  await writeFile(STATE_FILE, JSON.stringify(record, null, 2), 'utf-8')
}

export async function clearRecord(): Promise<void> {
  await ensureDataDir()
  await writeFile(
    STATE_FILE,
    JSON.stringify({
      state: { tables: [], orders: {}, kitchenTickets: [] },
      updatedAt: new Date(0).toISOString(),
      clientId: 'system',
    }),
    'utf-8',
  )
}

export function isNewer(incoming: SyncPayload, existing: StoredRecord | null): boolean {
  if (!existing) return true
  return new Date(incoming.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()
}