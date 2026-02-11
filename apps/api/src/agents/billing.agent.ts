import { getBillingByConversation } from '../tools/billings.tools.js'

export async function billingAgent(
  message: string,
  conversationId: string
): Promise<string> {

  const billing = await getBillingByConversation(conversationId)

  if (!billing) {
    return 'Billing Agent: No billing record found for this conversation.'
  }

  return `Billing Agent: Your payment of $${billing.amount} is currently ${billing.status}.`
}
