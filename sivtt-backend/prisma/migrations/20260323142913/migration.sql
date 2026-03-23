/*
  Warnings:

  - The values [ARCHIVADO] on the enum `EstadoProceso` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoProceso_new" AS ENUM ('ACTIVO', 'PAUSADO', 'FINALIZADO', 'CANCELADO');
ALTER TABLE "ProcesoVinculacion" ALTER COLUMN "estado" TYPE "EstadoProceso_new" USING ("estado"::text::"EstadoProceso_new");
ALTER TABLE "HistorialEstadoProceso" ALTER COLUMN "estadoAnterior" TYPE "EstadoProceso_new" USING ("estadoAnterior"::text::"EstadoProceso_new");
ALTER TABLE "HistorialEstadoProceso" ALTER COLUMN "estadoNuevo" TYPE "EstadoProceso_new" USING ("estadoNuevo"::text::"EstadoProceso_new");
ALTER TYPE "EstadoProceso" RENAME TO "EstadoProceso_old";
ALTER TYPE "EstadoProceso_new" RENAME TO "EstadoProceso";
DROP TYPE "public"."EstadoProceso_old";
COMMIT;
