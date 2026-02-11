-- CreateTable
CREATE TABLE "Billing" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("id")
);
