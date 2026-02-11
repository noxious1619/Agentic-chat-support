import { getOrderByConversation } from '../tools/order.tools.js'

export async function orderAgent(
  message: string,
  conversationId: string
): Promise<string> {

  const order = await getOrderByConversation(conversationId)

  if (!order) {
    return 'Order Agent: I could not find any order linked to this conversation.'
  }

  return `Order Agent: Your order is currently ${order.status}. Tracking number: ${order.trackingNumber}`
}
