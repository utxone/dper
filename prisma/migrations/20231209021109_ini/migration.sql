-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inscprion_id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "holder" TEXT NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);
