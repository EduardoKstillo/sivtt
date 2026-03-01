/*
  Warnings:

  - You are about to drop the column `rolProceso` on the `ProcesoUsuario` table. All the data in the column will be lost.
  - You are about to drop the column `rol` on the `UsuarioActividad` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[procesoId,usuarioId,rolId]` on the table `ProcesoUsuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `Rol` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[actividadId,usuarioId,rolId]` on the table `UsuarioActividad` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rolId` to the `ProcesoUsuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ambito` to the `Rol` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `codigo` on the `Rol` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `rolId` to the `UsuarioActividad` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AmbitoRol" AS ENUM ('SISTEMA', 'PROCESO', 'ACTIVIDAD', 'EMPRESA');

-- DropIndex
DROP INDEX "ProcesoUsuario_procesoId_usuarioId_rolProceso_key";

-- DropIndex
DROP INDEX "UsuarioActividad_actividadId_usuarioId_rol_key";

-- AlterTable
ALTER TABLE "ProcesoUsuario" DROP COLUMN "rolProceso",
ADD COLUMN     "rolId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Rol" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ambito" "AmbitoRol" NOT NULL,
DROP COLUMN "codigo",
ADD COLUMN     "codigo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UsuarioActividad" DROP COLUMN "rol",
ADD COLUMN     "rolId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "RolActividad";

-- DropEnum
DROP TYPE "RolProceso";

-- DropEnum
DROP TYPE "RolSistema";

-- CreateTable
CREATE TABLE "Permiso" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolPermiso" (
    "id" SERIAL NOT NULL,
    "rolId" INTEGER NOT NULL,
    "permisoId" INTEGER NOT NULL,

    CONSTRAINT "RolPermiso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_codigo_key" ON "Permiso"("codigo");

-- CreateIndex
CREATE INDEX "Permiso_modulo_idx" ON "Permiso"("modulo");

-- CreateIndex
CREATE UNIQUE INDEX "RolPermiso_rolId_permisoId_key" ON "RolPermiso"("rolId", "permisoId");

-- CreateIndex
CREATE INDEX "ProcesoUsuario_rolId_idx" ON "ProcesoUsuario"("rolId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcesoUsuario_procesoId_usuarioId_rolId_key" ON "ProcesoUsuario"("procesoId", "usuarioId", "rolId");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_codigo_key" ON "Rol"("codigo");

-- CreateIndex
CREATE INDEX "Rol_ambito_idx" ON "Rol"("ambito");

-- CreateIndex
CREATE INDEX "Rol_codigo_idx" ON "Rol"("codigo");

-- CreateIndex
CREATE INDEX "Rol_activo_idx" ON "Rol"("activo");

-- CreateIndex
CREATE INDEX "UsuarioActividad_rolId_idx" ON "UsuarioActividad"("rolId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioActividad_actividadId_usuarioId_rolId_key" ON "UsuarioActividad"("actividadId", "usuarioId", "rolId");

-- AddForeignKey
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolPermiso" ADD CONSTRAINT "RolPermiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcesoUsuario" ADD CONSTRAINT "ProcesoUsuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioActividad" ADD CONSTRAINT "UsuarioActividad_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
