import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando seed de TallerSync...")

  // ── Organización ─────────────────────────────
  const org = await prisma.organizacion.upsert({
    where:  { id: "org-tallersync-demo" },
    update: {},
    create: {
      id:     "org-tallersync-demo",
      nombre: "TallerSync Demo",
      plan:   "PRO",
    },
  })
  console.log(`✓ Organización: ${org.nombre}`)

  // ── Locales ───────────────────────────────────
  const localCentro = await prisma.local.upsert({
    where:  { slug: "santiago-centro" },
    update: {},
    create: {
      nombre:        "Santiago Centro",
      slug:          "santiago-centro",
      direccion:     "Av. Libertador Bernardo O'Higgins 1234, Santiago",
      telefono:      "+56 2 2345 6789",
      email:         "centro@tallersync.app",
      organizacionId: org.id,
    },
  })
  console.log(`✓ Local: ${localCentro.nombre}`)

  const localMaipу = await prisma.local.upsert({
    where:  { slug: "maipu" },
    update: {},
    create: {
      nombre:        "Maipú",
      slug:          "maipu",
      direccion:     "Av. Pajaritos 3000, Maipú",
      telefono:      "+56 2 2987 6543",
      email:         "maipu@tallersync.app",
      organizacionId: org.id,
    },
  })
  console.log(`✓ Local: ${localMaipу.nombre}`)

  // ── Usuarios ──────────────────────────────────
  const passwordAdmin    = await bcrypt.hash("Admin1234!", 12)
  const passwordTecnico  = await bcrypt.hash("Admin1234!", 12)
  const passwordRecepcion = await bcrypt.hash("Admin1234!", 12)

  const admin = await prisma.usuario.upsert({
    where:  { email: "admin@tallersync.app" },
    update: {},
    create: {
      nombre:        "Administrador Demo",
      email:         "admin@tallersync.app",
      passwordHash:  passwordAdmin,
      rol:           "ADMIN",
      organizacionId: org.id,
    },
  })
  console.log(`✓ Usuario ADMIN: ${admin.email}`)

  const tecnico1 = await prisma.usuario.upsert({
    where:  { email: "carlos.munoz@tallersync.app" },
    update: {},
    create: {
      nombre:        "Carlos Muñoz",
      email:         "carlos.munoz@tallersync.app",
      passwordHash:  passwordTecnico,
      rol:           "TECNICO",
      organizacionId: org.id,
    },
  })
  console.log(`✓ Usuario TÉCNICO: ${tecnico1.email}`)

  const tecnico2 = await prisma.usuario.upsert({
    where:  { email: "pedro.soto@tallersync.app" },
    update: {},
    create: {
      nombre:        "Pedro Soto",
      email:         "pedro.soto@tallersync.app",
      passwordHash:  passwordTecnico,
      rol:           "TECNICO",
      organizacionId: org.id,
    },
  })
  console.log(`✓ Usuario TÉCNICO: ${tecnico2.email}`)

  const recepcion = await prisma.usuario.upsert({
    where:  { email: "recepcion@tallersync.app" },
    update: {},
    create: {
      nombre:        "Recepción Centro",
      email:         "recepcion@tallersync.app",
      passwordHash:  passwordRecepcion,
      rol:           "RECEPCION",
      organizacionId: org.id,
    },
  })
  console.log(`✓ Usuario RECEPCIÓN: ${recepcion.email}`)

  // ── Asignar usuarios a locales ─────────────────
  await prisma.usuarioLocal.upsert({
    where:  { usuarioId_localId: { usuarioId: admin.id, localId: localCentro.id } },
    update: {},
    create: { usuarioId: admin.id, localId: localCentro.id, esPrincipal: true },
  })
  await prisma.usuarioLocal.upsert({
    where:  { usuarioId_localId: { usuarioId: admin.id, localId: localMaipу.id } },
    update: {},
    create: { usuarioId: admin.id, localId: localMaipу.id, esPrincipal: false },
  })
  await prisma.usuarioLocal.upsert({
    where:  { usuarioId_localId: { usuarioId: tecnico1.id, localId: localCentro.id } },
    update: {},
    create: { usuarioId: tecnico1.id, localId: localCentro.id, esPrincipal: true },
  })
  await prisma.usuarioLocal.upsert({
    where:  { usuarioId_localId: { usuarioId: tecnico2.id, localId: localCentro.id } },
    update: {},
    create: { usuarioId: tecnico2.id, localId: localCentro.id, esPrincipal: true },
  })
  await prisma.usuarioLocal.upsert({
    where:  { usuarioId_localId: { usuarioId: recepcion.id, localId: localCentro.id } },
    update: {},
    create: { usuarioId: recepcion.id, localId: localCentro.id, esPrincipal: true },
  })
  console.log("✓ Usuarios asignados a locales")

  // ── Proveedores ───────────────────────────────
  const providers = [
    {
      nombre: "Electromax Chile",
      email: "ventas@electromax.cl",
      contactoNombre: "Andrea Rojas",
      telefono: "+56 2 2456 7788",
      direccion: "Av. Industrial 450, Santiago",
      notas: "Proveedor de electrónica y línea blanca",
    },
    {
      nombre: "RefriAndes SpA",
      email: "compras@refriandes.cl",
      contactoNombre: "Matías Núñez",
      telefono: "+56 2 2567 8899",
      direccion: "Camino a Melipilla 10200, Maipú",
      notas: "Especialista en refrigeración",
    },
    {
      nombre: "ServiPartes Mayorista",
      email: "contacto@servipartes.cl",
      contactoNombre: "Camila Pérez",
      telefono: "+56 2 2678 9900",
      direccion: "Panamericana Norte 123, Quilicura",
      notas: "Despacho 24 a 48 horas en RM",
    },
  ]

  for (const provider of providers) {
    await prisma.proveedor.upsert({
      where: {
        organizacionId_nombre: {
          organizacionId: org.id,
          nombre: provider.nombre,
        },
      },
      update: {
        email: provider.email,
        contactoNombre: provider.contactoNombre,
        telefono: provider.telefono,
        direccion: provider.direccion,
        notas: provider.notas,
        activo: true,
      },
      create: {
        ...provider,
        activo: true,
        organizacionId: org.id,
      },
    })
  }
  console.log("✓ Proveedores creados")

  // ── Resumen de credenciales ────────────────────
  console.log("\n─────────────────────────────────────────")
  console.log("  Credenciales de acceso:")
  console.log("─────────────────────────────────────────")
  console.log("  ADMIN        admin@tallersync.app       / Admin1234!")
  console.log("  TÉCNICO      carlos.munoz@tallersync.app / Tecnico123!")
  console.log("  TÉCNICO      pedro.soto@tallersync.app  / Tecnico123!")
  console.log("  RECEPCIÓN    recepcion@tallersync.app   / Recepcion123!")
  console.log("─────────────────────────────────────────\n")
  console.log("🎉 Seed completado exitosamente.")
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
