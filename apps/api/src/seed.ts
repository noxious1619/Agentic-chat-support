import { prisma } from './prisma.js'

async function seed() {
  await prisma.order.create({
    data: {
      conversationId: 'persist-test',
      status: 'shipped',
      trackingNumber: 'TRK123456',
    },
  })

  console.log('Order seed inserted')
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
