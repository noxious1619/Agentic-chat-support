import type { Conversation, Message } from '@repo/shared/index';

const conversations = new Map<string, Conversation>();

export function getConversation(id: string): Conversation {
  if (!conversations.has(id)) {
    conversations.set(id, { id, messages: [] });
  }
  return conversations.get(id)!;
}

export function addMessage(
  conversationId: string,
  message: Message
) {
  const convo = getConversation(conversationId);
  convo.messages.push(message);
}
