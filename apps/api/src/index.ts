import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { addMessage } from './store';
import type { Message } from '@repo/shared';

import { routeMessage } from './agents/router.js';
import { supportAgent } from './agents/support.agent.js';
import { orderAgent } from './agents/order.agent.js';
import { billingAgent } from './agents/billing.agent.js';

const app = new Hono();

app.post('/api/chat/messages', async (c) => {
  const body = await c.req.json();
  const { conversationId, content } = body;

  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: 'user',
    content,
    createdAt: Date.now(),
  };

  addMessage(conversationId, userMessage);

  // 🔥 STEP 3 LOGIC STARTS HERE
  const agentType = routeMessage(content);

  let replyText = '';

  if (agentType === 'order') {
    replyText = orderAgent(content);
  } else if (agentType === 'billing') {
    replyText = billingAgent(content);
  } else {
    replyText = supportAgent(content);
  }

  const agentMessage: Message = {
    id: crypto.randomUUID(),
    role: 'agent',
    content: replyText,
    createdAt: Date.now(),
  };

  addMessage(conversationId, agentMessage);

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
