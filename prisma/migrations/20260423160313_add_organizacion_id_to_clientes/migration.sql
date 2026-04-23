/*
  Warnings:

  - Added the required column `organizacionId` to the `clientes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CanalNotificacion" AS ENUM ('EMAIL', 'WHATSAPP', 'LINK_WHATSAPP');

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "organizacionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "notificaciones" ADD COLUMN     "canal" "CanalNotificacion" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "telefonoDestino" TEXT,
ALTER COLUMN "asunto" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
