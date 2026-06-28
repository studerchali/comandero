import cors from '@fastify/cors'
import Fastify from 'fastify'
import { restaurantRoutes } from './routes/restaurant.js'

const PORT = Number(process.env.PORT ?? 3001)
const HOST = process.env.HOST ?? '0.0.0.0'
const API_KEY = process.env.COMANDERO_API_KEY ?? ''

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: true,
  methods: ['GET', 'PUT', 'DELETE', 'OPTIONS'],
})

if (API_KEY) {
  app.addHook('onRequest', async (request, reply) => {
    if (request.url === '/api/health') return

    const headerKey = request.headers['x-api-key']
    if (headerKey !== API_KEY) {
      return reply.status(401).send({ error: 'API key inválida' })
    }
  })
}

await app.register(restaurantRoutes)

try {
  await app.listen({ port: PORT, host: HOST })
  console.log(`Comandero API → http://${HOST}:${PORT}`)
} catch (error) {
  app.log.error(error)
  process.exit(1)
}