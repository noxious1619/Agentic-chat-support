import { prisma } from '../prisma.js'
import { routeMessage } from '../agents/router.js'
import { supportAgent } from '../agents/support.agent.js'
import { orderAgent } from '../agents/order.agent.js'
import { billingAgent } from '../agents/billing.agent.js'

const rateLimitMap = new Map<string, { timestamps: number[] }>()

const MESSAGE_LIMIT = 5
const WINDOW_MS = 10_000

export async function handleChatWorkflow(
  conversationId: string,
  content: string
) {
  // =============================
  // 🔥 RATE LIMIT
  // =============================

  const now = Date.now()
  const record = rateLimitMap.get(conversationId) || { timestamps: [] }

  record.timestamps = record.timestamps.filter(
    (ts) => now - ts < WINDOW_MS
  )

  if (record.timestamps.length >= MESSAGE_LIMIT) {
    return { error: 'Too many messages. Please slow down.' }
  }

  record.timestamps.push(now)
  rateLimitMap.set(conversationId, record)

  // =============================
  // Ensure conversation exists
  // =============================

  await prisma.conversation.upsert({
    where: { id: conversationId },
    update: {},
    create: { id: conversationId },
  })

  // =============================
  // Save user message
  // =============================

  await prisma.message.create({
    data: {
      conversationId,
      role: 'user',
      content,
    },
  })

  // =============================
  // Agent routing
  // =============================

  const agentType = routeMessage(content)

  let replyText = ''

  if (agentType === 'order') {
    replyText = await orderAgent(content, conversationId)
  } else if (agentType === 'billing') {
    replyText = await billingAgent(content, conversationId)
  } else {
    replyText = await supportAgent(content, conversationId)
  }

  // =============================
  // Save agent message
  // =============================

  await prisma.message.create({
    data: {
      conversationId,
      role: 'agent',
      content: replyText,
    },
  })

  return {
    agentType,
    replyText,
  }
}
