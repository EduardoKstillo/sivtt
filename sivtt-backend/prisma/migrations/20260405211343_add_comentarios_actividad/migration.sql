-- CreateTable
CREATE TABLE "ComentarioActividad" (
    "id" SERIAL NOT NULL,
    "actividadId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'MENSAJE',
    "evidenciaId" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComentarioActividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComentarioActividad_actividadId_idx" ON "ComentarioActividad"("actividadId");

-- CreateIndex
CREATE INDEX "ComentarioActividad_usuarioId_idx" ON "ComentarioActividad"("usuarioId");

-- AddForeignKey
ALTER TABLE "ComentarioActividad" ADD CONSTRAINT "ComentarioActividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "ActividadFase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioActividad" ADD CONSTRAINT "ComentarioActividad_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioActividad" ADD CONSTRAINT "ComentarioActividad_evidenciaId_fkey" FOREIGN KEY ("evidenciaId") REFERENCES "EvidenciaActividad"("id") ON DELETE SET NULL ON UPDATE CASCADE;
