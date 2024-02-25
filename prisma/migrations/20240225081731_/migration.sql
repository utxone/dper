-- CreateTable
CREATE TABLE "Ticker" (
    "id" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tick" TEXT NOT NULL,
    "inscription_id" TEXT NOT NULL,
    "inscription_number" INTEGER NOT NULL,
    "max" TEXT NOT NULL,
    "limit" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "minted" TEXT NOT NULL,
    "mint_progress" TEXT NOT NULL,
    "transactions" INTEGER NOT NULL,
    "holders" INTEGER NOT NULL,
    "deployer" TEXT NOT NULL,
    "deploy_time" INTEGER NOT NULL,

    CONSTRAINT "Ticker_pkey" PRIMARY KEY ("id")
);
