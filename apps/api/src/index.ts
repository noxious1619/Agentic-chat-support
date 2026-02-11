import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import type { Message } from '@repo/shared';

import { prisma } from './prisma.js';

import { routeMessage } from './agents/router.js';
import { supportAgent } from './agents/support.agent.js';
import { orderAgent } from './agents/order.agent.js';
import { billingAgent } from './agents/billing.agent.js';

const app = new Hono();

app.post('/api/chat/messages', async (c) => {
  const body = await c.req.json();
  const { conversationId, content } = body;

  // 1️⃣ Ensure conversation exists (DB version of getConversation)
  await prisma.conversation.upsert({
    where: { id: conversationId },
    update: {},
    create: { id: conversationId },
  });

  // 2️⃣ Save user message
  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    content,
    createdAt: Date.now(),
  };

  await prisma.message.create({
    data: {
      id: userMessage.id,
      conversationId,
      role: 'user',
      content: userMessage.content,
      createdAt: new Date(userMessage.createdAt),
    },
  });

  // 🔥 STEP 3 LOGIC (UNCHANGED)
  const agentType = routeMessage(content);

  let replyText = '';
  if (agentType === 'order') {
    replyText = await orderAgent(content, conversationId)
  } else if (agentType === 'billing') {
    replyText = await billingAgent(content, conversationId)
  } else {
    replyText = await supportAgent(content, conversationId );
  }

  // 3️⃣ Save agent message
  const agentMessage: Message = {
    id: crypto.randomUUID(),
    role: 'agent',
    content: replyText,
    createdAt: Date.now(),
  };

  await prisma.message.create({
    data: {
      id: agentMessage.id,
      conversationId,
      role: 'agent',
      content: agentMessage.content,
      createdAt: new Date(agentMessage.createdAt),
    },
  });

  return c.json({
    agentType,
    reply: agentMessage,
  });
});

serve({
  fetch: app.fetch,
  port: 3001,
});

console.log('API running on http://localhost:3001');
