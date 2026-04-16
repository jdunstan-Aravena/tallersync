-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'RECEPCION', 'TECNICO');

-- CreateEnum
CREATE TYPE "TipoEquipo" AS ENUM ('CELULAR', 'TABLET', 'NOTEBOOK', 'PC_ESCRITORIO', 'CONSOLA', 'ELECTRODOMESTICO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoOT" AS ENUM ('RECIBIDO', 'EN_DIAGNOSTICO', 'ESPERANDO_REPUESTO', 'EN_REPARACION', 'CONTROL_CALIDAD', 'LISTO_RETIRO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoFoto" AS ENUM ('INGRESO', 'PROCESO', 'ENTREGA');

-- CreateEnum
CREATE TYPE "TipoItem" AS ENUM ('MANO_OBRA', 'REPUESTO', 'SERVICIO_EXTERNO');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('CAMBIO_ESTADO', 'LISTO_RETIRO', 'PRESUPUESTO', 'RECORDATORIO');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('PENDIENTE', 'ENVIADO', 'ERROR');

-- CreateTable
CREATE TABLE "organizaciones" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "logo" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locales" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizacionId" TEXT NOT NULL,

    CONSTRAINT "locales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'TECNICO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizacionId" TEXT NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_locales" (
    "id" TEXT NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" TEXT NOT NULL,
    "localId" TEXT NOT NULL,

    CONSTRAINT "usuarios_locales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "rut" TEXT,
    "notas" TEXT,
    "tokenSeguimiento" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEquipo" NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "numeroSerie" TEXT,
    "color" TEXT,
    "accesorios" TEXT,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_trabajo" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "estado" "EstadoOT" NOT NULL DEFAULT 'RECIBIDO',
    "falla" TEXT NOT NULL,
    "diagnostico" TEXT,
    "solucion" TEXT,
    "condicionIngreso" TEXT,
    "garantiaDias" INTEGER NOT NULL DEFAULT 30,
    "requierePresupuesto" BOOLEAN NOT NULL DEFAULT false,
    "presupuestoAprobado" BOOLEAN,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCompromiso" TIMESTAMP(3),
    "fechaEntrega" TIMESTAMP(3),
    "totalManoObra" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalRepuestos" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tokenPublico" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "tecnicoId" TEXT,
    "creadoPorId" TEXT NOT NULL,

    CONSTRAINT "ordenes_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_ot" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nombre" TEXT,
    "tipo" "TipoFoto" NOT NULL DEFAULT 'INGRESO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ordenId" TEXT NOT NULL,

    CONSTRAINT "fotos_ot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_ot" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tipo" "TipoItem" NOT NULL DEFAULT 'MANO_OBRA',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ordenId" TEXT NOT NULL,
    "repuestoId" TEXT,

    CONSTRAINT "items_ot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_ot" (
    "id" TEXT NOT NULL,
    "estadoAnterior" "EstadoOT",
    "estadoNuevo" "EstadoOT" NOT NULL,
    "nota" TEXT,
    "esVisibleCliente" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ordenId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "historial_ot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repuestos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sku" TEXT,
    "descripcion" TEXT,
    "precioCompra" DECIMAL(10,2),
    "precioVenta" DECIMAL(10,2) NOT NULL,
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "localId" TEXT NOT NULL,

    CONSTRAINT "repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "asunto" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "estadoEnvio" "EstadoEnvio" NOT NULL DEFAULT 'PENDIENTE',
    "errorMensaje" TEXT,
    "enviadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ordenId" TEXT,
    "clienteId" TEXT,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locales_slug_key" ON "locales"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_locales_usuarioId_localId_key" ON "usuarios_locales"("usuarioId", "localId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_tokenSeguimiento_key" ON "clientes"("tokenSeguimiento");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_trabajo_tokenPublico_key" ON "ordenes_trabajo"("tokenPublico");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_trabajo_localId_numero_key" ON "ordenes_trabajo"("localId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "repuestos_localId_sku_key" ON "repuestos"("localId", "sku");

-- AddForeignKey
ALTER TABLE "locales" ADD CONSTRAINT "locales_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "organizaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_locales" ADD CONSTRAINT "usuarios_locales_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_locales" ADD CONSTRAINT "usuarios_locales_localId_fkey" FOREIGN KEY ("localId") REFERENCES "locales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_localId_fkey" FOREIGN KEY ("localId") REFERENCES "locales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_ot" ADD CONSTRAINT "fotos_ot_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenes_trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_ot" ADD CONSTRAINT "items_ot_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenes_trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_ot" ADD CONSTRAINT "items_ot_repuestoId_fkey" FOREIGN KEY ("repuestoId") REFERENCES "repuestos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_ot" ADD CONSTRAINT "historial_ot_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenes_trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_ot" ADD CONSTRAINT "historial_ot_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repuestos" ADD CONSTRAINT "repuestos_localId_fkey" FOREIGN KEY ("localId") REFERENCES "locales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "ordenes_trabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
