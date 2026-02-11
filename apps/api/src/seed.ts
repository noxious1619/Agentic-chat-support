import { prisma } from './prisma.js'

async function seed() {
    await prisma.billing.create({
    data: {
      conversationId: 'persist-test',
      amount: 120,
      status: 'paid',
    },
})

  console.log('bill seed inserted');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
