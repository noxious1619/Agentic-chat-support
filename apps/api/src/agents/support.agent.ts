import { getConversationHistory } from '../tools/conversation.tools.js'

export async function supportAgent(
  message: string,
  conversationId: string
): Promise<string> {

  const history = await getConversationHistory(conversationId)

  return `Support Agent: I can see ${history.length} messages in this conversation. How can I help you further?`
}
