import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

serve({
  fetch: app.fetch,
  port: 3001,
})

console.log('API running on http://localhost:3001')
