/*
  Warnings:

  - You are about to drop the column `comentarioRevision` on the `EvidenciaActividad` table. All the data in the column will be lost.
  - You are about to drop the column `fechaRevision` on the `EvidenciaActividad` table. All the data in the column will be lost.
  - You are about to drop the column `revisadoPorId` on the `EvidenciaActividad` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EvidenciaActividad" DROP CONSTRAINT "EvidenciaActividad_revisadoPorId_fkey";

-- DropIndex
DROP INDEX "EvidenciaActividad_revisadoPorId_idx";

-- AlterTable
ALTER TABLE "EvidenciaActividad" DROP COLUMN "comentarioRevision",
DROP COLUMN "fechaRevision",
DROP COLUMN "revisadoPorId";

-- CreateTable
CREATE TABLE "EvaluacionEvidencia" (
    "id" SERIAL NOT NULL,
    "evidenciaId" INTEGER NOT NULL,
    "revisorId" INTEGER NOT NULL,
    "estado" "EstadoEvidencia" NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluacionEvidencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvaluacionEvidencia_evidenciaId_idx" ON "EvaluacionEvidencia"("evidenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluacionEvidencia_evidenciaId_revisorId_key" ON "EvaluacionEvidencia"("evidenciaId", "revisorId");

-- AddForeignKey
ALTER TABLE "EvaluacionEvidencia" ADD CONSTRAINT "EvaluacionEvidencia_evidenciaId_fkey" FOREIGN KEY ("evidenciaId") REFERENCES "EvidenciaActividad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionEvidencia" ADD CONSTRAINT "EvaluacionEvidencia_revisorId_fkey" FOREIGN KEY ("revisorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
