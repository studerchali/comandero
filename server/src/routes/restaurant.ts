import type { FastifyInstance } from 'fastify'
import { clearRecord, isNewer, readRecord, writeRecord } from '../persistence.js'
import { syncPayloadSchema } from '../validation.js'

export async function restaurantRoutes(app: FastifyInstance) {
  app.get('/api/health', async () => ({
    ok: true,
    service: 'comandero-server',
    timestamp: new Date().toISOString(),
  }))

  app.get('/api/restaurant/state', async (request, reply) => {
    const record = await readRecord()
    if (!record) {
      return reply.status(404).send({ error: 'Sin datos en el servidor' })
    }
    return record
  })

  app.put('/api/restaurant/state', async (request, reply) => {
    const parsed = syncPayloadSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Payload inválido',
        details: parsed.error.flatten(),
      })
    }

    const incoming = parsed.data
    const existing = await readRecord()

    if (!isNewer(incoming, existing)) {
      return reply.status(409).send({
        error: 'Conflicto de sincronización',
        message: 'El servidor tiene datos más recientes',
        server: existing,
      })
    }

    await writeRecord({
      state: incoming.state,
      updatedAt: incoming.updatedAt,
      clientId: incoming.clientId,
    })

    return {
      ok: true,
      updatedAt: incoming.updatedAt,
      clientId: incoming.clientId,
    }
  })

  app.delete('/api/restaurant/state', async () => {
    await clearRecord()
    return { ok: true }
  })
}