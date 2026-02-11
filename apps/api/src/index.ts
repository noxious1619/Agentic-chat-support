import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { stream } from 'hono/streaming'

import { handleChatWorkflow } from './workflows/chat.workflow.js'

const app = new Hono()

// 🌍 CORS
app.use(
  '*',
  cors({
    origin: 'http://localhost:3000',
  })
)

// 🚀 Chat Route (Transport Layer Only)
app.post('/api/chat/messages', async (c) => {
  const body = await c.req.json()
  const { conversationId, content } = body

  const result = await handleChatWorkflow(conversationId, content)

  if ('error' in result) {
    return c.json({ error: result.error }, 429)
  }

  // Send agent type as header (optional)
  c.header('X-Agent-Type', result.agentType)

  // Stream response
  return stream(c, async (stream) => {
    const words = result.replyText.split(' ')

    for (const word of words) {
      await stream.write(word + ' ')
      await new Promise((res) => setTimeout(res, 80))
    }
  })
})

// 🟢 Start Server
serve({
  fetch: app.fetch,
  port: 3001,
})

console.log('API running on http://localhost:3001')
