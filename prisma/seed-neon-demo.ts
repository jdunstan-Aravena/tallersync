import "dotenv/config"
import { Prisma, PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const ORG_ID = "org-tallersync-demo"
const LOCAL_SLUG = "santiago-centro"
const PASSWORD = "Admin1234!"

function daysFromNow(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

function money(value: number) {
  return new Prisma.Decimal(value)
}

async function ensureBaseData() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12)

  const org = await prisma.organizacion.upsert({
    where: { id: ORG_ID },
    update: {},
    create: {
      id: ORG_ID,
      nombre: "TallerSync Demo",
      plan: "PRO",
    },
  })

  const local = await prisma.local.upsert({
    where: { slug: LOCAL_SLUG },
    update: {
      nombre: "Santiago Centro",
      activo: true,
      organizacionId: org.id,
    },
    create: {
      nombre: "Santiago Centro",
      slug: LOCAL_SLUG,
      direccion: "Av. Libertador Bernardo O'Higgins 1234, Santiago",
      telefono: "+56 2 2345 6789",
      email: "centro@tallersync.app",
      organizacionId: org.id,
    },
  })

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@tallersync.app" },
    update: { activo: true, organizacionId: org.id },
    create: {
      nombre: "Administrador Demo",
      email: "admin@tallersync.app",
      passwordHash,
      rol: "ADMIN",
      organizacionId: org.id,
    },
  })

  const recepcion = await prisma.usuario.upsert({
    where: { email: "recepcion@tallersync.app" },
    update: { activo: true, organizacionId: org.id },
    create: {
      nombre: "Recepcion Centro",
      email: "recepcion@tallersync.app",
      passwordHash,
      rol: "RECEPCION",
      organizacionId: org.id,
    },
  })

  const tecnico = await prisma.usuario.upsert({
    where: { email: "carlos.munoz@tallersync.app" },
    update: { activo: true, organizacionId: org.id },
    create: {
      nombre: "Carlos Munoz",
      email: "carlos.munoz@tallersync.app",
      passwordHash,
      rol: "TECNICO",
      organizacionId: org.id,
    },
  })

  for (const user of [admin, recepcion, tecnico]) {
    await prisma.usuarioLocal.upsert({
      where: { usuarioId_localId: { usuarioId: user.id, localId: local.id } },
      update: {},
      create: {
        usuarioId: user.id,
        localId: local.id,
        esPrincipal: user.email !== "admin@tallersync.app",
      },
    })
  }

  const proveedor = await prisma.proveedor.upsert({
    where: {
      organizacionId_nombre: {
        organizacionId: org.id,
        nombre: "ServiPartes Mayorista",
      },
    },
    update: {
      email: "contacto@servipartes.cl",
      activo: true,
    },
    create: {
      nombre: "ServiPartes Mayorista",
      email: "contacto@servipartes.cl",
      contactoNombre: "Camila Perez",
      telefono: "+56 2 2678 9900",
      direccion: "Panamericana Norte 123, Quilicura",
      notas: "Despacho 24 a 48 horas en RM",
      activo: true,
      organizacionId: org.id,
    },
  })

  return { org, local, recepcion, tecnico, proveedor }
}

async function seedCategoriasYRepuestos(orgId: string, localId: string, proveedorId: string) {
  const categorias = [
    {
      nombre: "Pantallas y modulos",
      descripcion: "Displays, tactiles y modulos completos para celulares y tablets.",
    },
    {
      nombre: "Baterias y energia",
      descripcion: "Baterias, conectores de carga, fuentes y componentes de energia.",
    },
    {
      nombre: "Refrigeracion",
      descripcion: "Sensores, ventiladores y repuestos para linea blanca.",
    },
  ]

  const created = new Map<string, { id: string }>()

  for (const categoria of categorias) {
    const record = await prisma.categoriaRepuesto.upsert({
      where: {
        organizacionId_nombre: {
          organizacionId: orgId,
          nombre: categoria.nombre,
        },
      },
      update: {
        descripcion: categoria.descripcion,
        activo: true,
      },
      create: {
        ...categoria,
        activo: true,
        organizacionId: orgId,
      },
    })

    created.set(categoria.nombre, record)
  }

  const repuestos = [
    {
      sku: "TS-DEMO-PANT-IP11",
      nombre: "Modulo pantalla iPhone 11",
      descripcion: "Pantalla compatible para cambio rapido en demo.",
      precioCompra: 42990,
      precioVenta: 74990,
      stockActual: 3,
      stockMinimo: 2,
      categoria: "Pantallas y modulos",
    },
    {
      sku: "TS-DEMO-BAT-A52",
      nombre: "Bateria Samsung A52",
      descripcion: "Bateria de reemplazo para equipos Samsung serie A.",
      precioCompra: 12990,
      precioVenta: 29990,
      stockActual: 1,
      stockMinimo: 2,
      categoria: "Baterias y energia",
    },
    {
      sku: "TS-DEMO-SENS-NTC",
      nombre: "Sensor NTC refrigerador",
      descripcion: "Sensor de temperatura para diagnostico de frio intermitente.",
      precioCompra: 6990,
      precioVenta: 18990,
      stockActual: 6,
      stockMinimo: 3,
      categoria: "Refrigeracion",
    },
  ]

  const createdRepuestos = new Map<string, { id: string }>()

  for (const repuesto of repuestos) {
    const record = await prisma.repuesto.upsert({
      where: {
        localId_sku: {
          localId,
          sku: repuesto.sku,
        },
      },
      update: {
        nombre: repuesto.nombre,
        descripcion: repuesto.descripcion,
        precioCompra: money(repuesto.precioCompra),
        precioVenta: money(repuesto.precioVenta),
        stockActual: repuesto.stockActual,
        stockMinimo: repuesto.stockMinimo,
        activo: true,
        proveedorId,
        categoriaId: created.get(repuesto.categoria)?.id,
      },
      create: {
        sku: repuesto.sku,
        nombre: repuesto.nombre,
        descripcion: repuesto.descripcion,
        precioCompra: money(repuesto.precioCompra),
        precioVenta: money(repuesto.precioVenta),
        stockActual: repuesto.stockActual,
        stockMinimo: repuesto.stockMinimo,
        activo: true,
        localId,
        proveedorId,
        categoriaId: created.get(repuesto.categoria)?.id,
      },
    })

    createdRepuestos.set(repuesto.sku, record)
  }

  return createdRepuestos
}

async function upsertClienteConEquipo(input: {
  nombre: string
  email: string
  telefono: string
  rut: string
  notas: string
  tokenSeguimiento: string
  organizacionId: string
  equipo: {
    tipo: "CELULAR" | "NOTEBOOK" | "ELECTRODOMESTICO"
    marca: string
    modelo: string
    numeroSerie: string
    color?: string
    accesorios?: string
    notas?: string
  }
}) {
  const cliente = await prisma.cliente.upsert({
    where: { tokenSeguimiento: input.tokenSeguimiento },
    update: {
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono,
      rut: input.rut,
      notas: input.notas,
      organizacionId: input.organizacionId,
    },
    create: {
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono,
      rut: input.rut,
      notas: input.notas,
      tokenSeguimiento: input.tokenSeguimiento,
      organizacionId: input.organizacionId,
    },
  })

  const equipoExistente = await prisma.equipo.findFirst({
    where: {
      clienteId: cliente.id,
      numeroSerie: input.equipo.numeroSerie,
    },
  })

  const equipoData = {
    tipo: input.equipo.tipo,
    marca: input.equipo.marca,
    modelo: input.equipo.modelo,
    numeroSerie: input.equipo.numeroSerie,
    color: input.equipo.color,
    accesorios: input.equipo.accesorios,
    notas: input.equipo.notas,
    clienteId: cliente.id,
  }

  const equipo = equipoExistente
    ? await prisma.equipo.update({ where: { id: equipoExistente.id }, data: equipoData })
    : await prisma.equipo.create({ data: equipoData })

  return { cliente, equipo }
}

async function seedClientesYOrdenes(params: {
  orgId: string
  localId: string
  recepcionId: string
  tecnicoId: string
  repuestos: Map<string, { id: string }>
}) {
  const maria = await upsertClienteConEquipo({
    nombre: "Maria Gonzalez",
    email: "maria.gonzalez.demo@tallersync.app",
    telefono: "+56 9 6123 4567",
    rut: "12.345.678-5",
    notas: "Prefiere aviso por WhatsApp antes de aprobar presupuesto.",
    tokenSeguimiento: "cliente-demo-maria-gonzalez",
    organizacionId: params.orgId,
    equipo: {
      tipo: "CELULAR",
      marca: "Apple",
      modelo: "iPhone 11",
      numeroSerie: "DEMO-IP11-001",
      color: "Negro",
      accesorios: "Sin cargador, con lamina quebrada",
      notas: "Pantalla sin imagen despues de caida.",
    },
  })

  const jose = await upsertClienteConEquipo({
    nombre: "Jose Ramirez",
    email: "jose.ramirez.demo@tallersync.app",
    telefono: "+56 9 7456 1188",
    rut: "16.789.432-1",
    notas: "Cliente empresa, requiere factura al retirar.",
    tokenSeguimiento: "cliente-demo-jose-ramirez",
    organizacionId: params.orgId,
    equipo: {
      tipo: "NOTEBOOK",
      marca: "Lenovo",
      modelo: "ThinkPad T14",
      numeroSerie: "DEMO-T14-002",
      color: "Negro",
      accesorios: "Cargador original",
      notas: "Equipo se apaga al mover el conector.",
    },
  })

  const ana = await upsertClienteConEquipo({
    nombre: "Ana Fuentes",
    email: "ana.fuentes.demo@tallersync.app",
    telefono: "+56 9 8333 2190",
    rut: "18.234.901-7",
    notas: "Solicita seguimiento por link publico.",
    tokenSeguimiento: "cliente-demo-ana-fuentes",
    organizacionId: params.orgId,
    equipo: {
      tipo: "ELECTRODOMESTICO",
      marca: "Samsung",
      modelo: "RT38K5930SL",
      numeroSerie: "DEMO-REF-003",
      color: "Acero",
      accesorios: "Sin accesorios",
      notas: "Refrigerador enfria de forma intermitente.",
    },
  })

  const ordenes = [
    {
      numero: 1001,
      estado: "EN_DIAGNOSTICO" as const,
      clienteId: maria.cliente.id,
      equipoId: maria.equipo.id,
      falla: "Pantalla no enciende despues de golpe lateral.",
      diagnostico: "Modulo frontal danado; touch responde parcialmente.",
      condicionIngreso: "Marco con marcas de caida. Equipo enciende y vibra.",
      requierePresupuesto: true,
      presupuestoAprobado: false,
      fechaCompromiso: daysFromNow(2),
      totalManoObra: 18000,
      totalRepuestos: 74990,
      total: 92990,
      tokenPublico: "ot-demo-1001-maria",
      items: [
        {
          descripcion: "Diagnostico y cambio de pantalla",
          cantidad: 1,
          precioUnitario: 18000,
          subtotal: 18000,
          tipo: "MANO_OBRA" as const,
        },
        {
          descripcion: "Modulo pantalla iPhone 11",
          cantidad: 1,
          precioUnitario: 74990,
          subtotal: 74990,
          tipo: "REPUESTO" as const,
          repuestoId: params.repuestos.get("TS-DEMO-PANT-IP11")?.id,
        },
      ],
      historial: [
        {
          estadoAnterior: null,
          estadoNuevo: "RECIBIDO" as const,
          nota: "Equipo recibido en mostrador.",
          esVisibleCliente: true,
        },
        {
          estadoAnterior: "RECIBIDO" as const,
          estadoNuevo: "EN_DIAGNOSTICO" as const,
          nota: "Tecnico inicia revision visual y pruebas de encendido.",
          esVisibleCliente: true,
        },
      ],
    },
    {
      numero: 1002,
      estado: "EN_REPARACION" as const,
      clienteId: jose.cliente.id,
      equipoId: jose.equipo.id,
      falla: "Notebook se apaga al mover el cable de carga.",
      diagnostico: "Conector DC flojo, requiere resoldado y limpieza interna.",
      condicionIngreso: "Carcasa con desgaste normal. Cargador operativo.",
      requierePresupuesto: true,
      presupuestoAprobado: true,
      fechaCompromiso: daysFromNow(1),
      totalManoObra: 35000,
      totalRepuestos: 0,
      total: 35000,
      tokenPublico: "ot-demo-1002-jose",
      items: [
        {
          descripcion: "Resoldado conector DC y limpieza interna",
          cantidad: 1,
          precioUnitario: 35000,
          subtotal: 35000,
          tipo: "MANO_OBRA" as const,
        },
      ],
      historial: [
        {
          estadoAnterior: null,
          estadoNuevo: "RECIBIDO" as const,
          nota: "Ingreso con cargador original.",
          esVisibleCliente: true,
        },
        {
          estadoAnterior: "EN_DIAGNOSTICO" as const,
          estadoNuevo: "EN_REPARACION" as const,
          nota: "Presupuesto aprobado; equipo pasa a banco tecnico.",
          esVisibleCliente: true,
        },
      ],
    },
    {
      numero: 1003,
      estado: "LISTO_RETIRO" as const,
      clienteId: ana.cliente.id,
      equipoId: ana.equipo.id,
      falla: "Refrigerador pierde frio durante la noche.",
      diagnostico: "Sensor NTC fuera de rango.",
      solucion: "Sensor reemplazado y prueba de ciclo completada.",
      condicionIngreso: "Equipo limpio, sin golpes visibles.",
      requierePresupuesto: false,
      presupuestoAprobado: true,
      fechaCompromiso: daysFromNow(0),
      totalManoObra: 28000,
      totalRepuestos: 18990,
      total: 46990,
      tokenPublico: "ot-demo-1003-ana",
      items: [
        {
          descripcion: "Cambio sensor de temperatura y prueba funcional",
          cantidad: 1,
          precioUnitario: 28000,
          subtotal: 28000,
          tipo: "MANO_OBRA" as const,
        },
        {
          descripcion: "Sensor NTC refrigerador",
          cantidad: 1,
          precioUnitario: 18990,
          subtotal: 18990,
          tipo: "REPUESTO" as const,
          repuestoId: params.repuestos.get("TS-DEMO-SENS-NTC")?.id,
        },
      ],
      historial: [
        {
          estadoAnterior: null,
          estadoNuevo: "RECIBIDO" as const,
          nota: "Equipo ingresado para revision de frio.",
          esVisibleCliente: true,
        },
        {
          estadoAnterior: "CONTROL_CALIDAD" as const,
          estadoNuevo: "LISTO_RETIRO" as const,
          nota: "Reparacion terminada y lista para retiro.",
          esVisibleCliente: true,
        },
      ],
    },
  ]

  for (const orden of ordenes) {
    const record = await prisma.ordenTrabajo.upsert({
      where: {
        localId_numero: {
          localId: params.localId,
          numero: orden.numero,
        },
      },
      update: {
        estado: orden.estado,
        falla: orden.falla,
        diagnostico: orden.diagnostico,
        solucion: orden.solucion,
        condicionIngreso: orden.condicionIngreso,
        requierePresupuesto: orden.requierePresupuesto,
        presupuestoAprobado: orden.presupuestoAprobado,
        fechaCompromiso: orden.fechaCompromiso,
        totalManoObra: money(orden.totalManoObra),
        totalRepuestos: money(orden.totalRepuestos),
        total: money(orden.total),
        tokenPublico: orden.tokenPublico,
        clienteId: orden.clienteId,
        equipoId: orden.equipoId,
        tecnicoId: params.tecnicoId,
        creadoPorId: params.recepcionId,
      },
      create: {
        numero: orden.numero,
        estado: orden.estado,
        falla: orden.falla,
        diagnostico: orden.diagnostico,
        solucion: orden.solucion,
        condicionIngreso: orden.condicionIngreso,
        requierePresupuesto: orden.requierePresupuesto,
        presupuestoAprobado: orden.presupuestoAprobado,
        fechaCompromiso: orden.fechaCompromiso,
        totalManoObra: money(orden.totalManoObra),
        totalRepuestos: money(orden.totalRepuestos),
        total: money(orden.total),
        tokenPublico: orden.tokenPublico,
        clienteId: orden.clienteId,
        equipoId: orden.equipoId,
        localId: params.localId,
        tecnicoId: params.tecnicoId,
        creadoPorId: params.recepcionId,
      },
    })

    await prisma.itemOT.deleteMany({ where: { ordenId: record.id } })
    await prisma.historialOT.deleteMany({ where: { ordenId: record.id } })

    await prisma.itemOT.createMany({
      data: orden.items.map((item) => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precioUnitario: money(item.precioUnitario),
        subtotal: money(item.subtotal),
        tipo: item.tipo,
        ordenId: record.id,
        repuestoId: "repuestoId" in item ? item.repuestoId : undefined,
      })),
    })

    await prisma.historialOT.createMany({
      data: orden.historial.map((historial) => ({
        estadoAnterior: historial.estadoAnterior,
        estadoNuevo: historial.estadoNuevo,
        nota: historial.nota,
        esVisibleCliente: historial.esVisibleCliente,
        ordenId: record.id,
        usuarioId: params.recepcionId,
      })),
    })
  }
}

async function seedOrdenCompra(params: {
  localId: string
  proveedorId: string
  proveedorNombre: string
  creadoPorId: string
  tecnicoId: string
  bateriaId?: string
}) {
  const ordenCompra = await prisma.ordenCompra.upsert({
    where: {
      localId_numero: {
        localId: params.localId,
        numero: 5001,
      },
    },
    update: {
      estado: "ENVIADA",
      proveedorNombre: params.proveedorNombre,
      nota: "Reposicion demo para mostrar flujo de compra y stock bajo.",
      total: money(59980),
      enviadoProveedorEn: daysFromNow(-1),
      proveedorId: params.proveedorId,
      creadoPorId: params.creadoPorId,
      tecnicoAsignadoId: params.tecnicoId,
    },
    create: {
      numero: 5001,
      estado: "ENVIADA",
      proveedorNombre: params.proveedorNombre,
      nota: "Reposicion demo para mostrar flujo de compra y stock bajo.",
      total: money(59980),
      enviadoProveedorEn: daysFromNow(-1),
      localId: params.localId,
      proveedorId: params.proveedorId,
      creadoPorId: params.creadoPorId,
      tecnicoAsignadoId: params.tecnicoId,
    },
  })

  await prisma.itemOrdenCompra.deleteMany({ where: { ordenCompraId: ordenCompra.id } })
  await prisma.itemOrdenCompra.createMany({
    data: [
      {
        descripcion: "Bateria Samsung A52",
        cantidad: 4,
        costoUnitario: money(14995),
        subtotal: money(59980),
        ordenCompraId: ordenCompra.id,
        repuestoId: params.bateriaId,
      },
    ],
  })
}

async function main() {
  console.log("Seed Neon demo: iniciando...")

  const base = await ensureBaseData()
  const repuestos = await seedCategoriasYRepuestos(base.org.id, base.local.id, base.proveedor.id)

  await seedClientesYOrdenes({
    orgId: base.org.id,
    localId: base.local.id,
    recepcionId: base.recepcion.id,
    tecnicoId: base.tecnico.id,
    repuestos,
  })

  await seedOrdenCompra({
    localId: base.local.id,
    proveedorId: base.proveedor.id,
    proveedorNombre: base.proveedor.nombre,
    creadoPorId: base.recepcion.id,
    tecnicoId: base.tecnico.id,
    bateriaId: repuestos.get("TS-DEMO-BAT-A52")?.id,
  })

  console.log("Seed Neon demo: listo.")
  console.log("Login demo: admin@tallersync.app / Admin1234!")
  console.log("OT demo: 1001, 1002, 1003")
  console.log("Orden de compra demo: 5001")
}

main()
  .catch((error) => {
    console.error("Seed Neon demo: error", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
