-- DropIndex
DROP INDEX "FaseProceso_procesoId_fase_key";

-- CreateIndex
CREATE INDEX "FaseProceso_procesoId_fase_idx" ON "FaseProceso"("procesoId", "fase");
