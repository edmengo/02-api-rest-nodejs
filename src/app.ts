import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { trasnsactionsRoutes } from './routes/transactions'

export const app = fastify()

app.register(cookie)

// Usar quando quiser capturar todos os log das rotas que estão abaixo desse hook
// app.addHook('preHandler', async (request) => {
//  console.log(`[${request.method}] ${request.url}`)
// })

app.register(trasnsactionsRoutes, {
  prefix: 'transactions',
})

// Rota de teste
// app.get('/ping', () => {
//  return 'pong'
// })
