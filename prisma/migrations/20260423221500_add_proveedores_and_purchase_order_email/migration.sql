-- CreateTable
CREATE TABLE "proveedores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "contactoNombre" TEXT,
    "direccion" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "organizacionId" TEXT NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ordenes_compra"
ADD COLUMN "enviadoProveedorEn" TIMESTAMP(3),
ADD COLUMN "proveedorId" TEXT;

-- AlterTable
ALTER TABLE "repuestos"
ADD COLUMN "proveedorId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_organizacionId_nombre_key" ON "proveedores"("organizacionId", "nombre");

-- CreateIndex
CREATE INDEX "proveedores_organizacionId_idx" ON "proveedores"("organizacionId");

-- CreateIndex
CREATE INDEX "ordenes_compra_proveedorId_idx" ON "ordenes_compra"("proveedorId");

-- CreateIndex
CREATE INDEX "repuestos_proveedorId_idx" ON "repuestos"("proveedorId");

-- AddForeignKey
ALTER TABLE "proveedores" ADD CONSTRAINT "proveedores_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_compra" ADD CONSTRAINT "ordenes_compra_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repuestos" ADD CONSTRAINT "repuestos_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
