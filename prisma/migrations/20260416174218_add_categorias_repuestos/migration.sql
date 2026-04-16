-- AlterTable
ALTER TABLE "repuestos" ADD COLUMN     "categoriaId" TEXT;

-- CreateTable
CREATE TABLE "categorias_repuestos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizacionId" TEXT NOT NULL,

    CONSTRAINT "categorias_repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_repuestos_organizacionId_nombre_key" ON "categorias_repuestos"("organizacionId", "nombre");

-- AddForeignKey
ALTER TABLE "repuestos" ADD CONSTRAINT "repuestos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_repuestos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_repuestos" ADD CONSTRAINT "categorias_repuestos_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
