import { prisma } from '../prisma.js'

export async function getBillingByConversation(
  conversationId: string
) {
  return prisma.billing.findFirst({
    where: { conversationId },
  })
}
