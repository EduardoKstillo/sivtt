-- CreateTable
CREATE TABLE "SecuenciaSistema" (
    "id" TEXT NOT NULL,
    "valor" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecuenciaSistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecuenciaSistema_id_idx" ON "SecuenciaSistema"("id");
