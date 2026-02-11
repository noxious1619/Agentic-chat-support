-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
