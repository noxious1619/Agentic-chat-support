import { prisma } from '../prisma.js'

export async function getOrderByConversation(
  conversationId: string
) {
  return prisma.order.findFirst({
    where: { conversationId },
  })
}
