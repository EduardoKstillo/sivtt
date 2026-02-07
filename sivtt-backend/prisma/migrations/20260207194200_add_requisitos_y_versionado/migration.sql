-- AlterTable
ALTER TABLE "EvidenciaActividad" ADD COLUMN     "requisitoId" INTEGER;

-- CreateTable
CREATE TABLE "RequisitoActividad" (
    "id" SERIAL NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "obligatorio" BOOLEAN NOT NULL DEFAULT true,
    "formato" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequisitoActividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequisitoActividad_actividadId_idx" ON "RequisitoActividad"("actividadId");

-- CreateIndex
CREATE INDEX "EvidenciaActividad_requisitoId_idx" ON "EvidenciaActividad"("requisitoId");

-- AddForeignKey
ALTER TABLE "EvidenciaActividad" ADD CONSTRAINT "EvidenciaActividad_requisitoId_fkey" FOREIGN KEY ("requisitoId") REFERENCES "RequisitoActividad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequisitoActividad" ADD CONSTRAINT "RequisitoActividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "ActividadFase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
