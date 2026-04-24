import { cache } from "react"
import { EstadoOrdenCompra, EstadoOT, Rol } from "@prisma/client"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export type DashboardLocal = {
  id: string
  nombre: string
  slug: string
  esPrincipal: boolean
}

export type DashboardContext = {
  user: {
    id: string
    nombre: string
    email: string
    rol: Rol
    rolLabel: string
    initials: string
    organizacionId: string
  }
  organization: {
    id: string
    nombre: string
  }
  locales: DashboardLocal[]
  localPrincipal: DashboardLocal | null
}

export type PurchaseSuggestion = {
  id: string
  nombre: string
  sku: string | null
  localId: string
  localNombre: string
  proveedorId: string | null
  proveedorNombre: string | null
  stockActual: number
  stockMinimo: number
  quantityToOrder: number
  estimatedCost: number
  urgency: "critica" | "media"
}

export type PurchaseSuggestionGroup = {
  localId: string
  localNombre: string
  items: PurchaseSuggestion[]
  itemCount: number
  criticalCount: number
  totalEstimatedCost: number
}

export type PurchaseOrderSummary = {
  id: string
  numero: number
  estado: EstadoOrdenCompra
  proveedorId: string | null
  proveedorNombre: string | null
  proveedorEmail: string | null
  nota: string | null
  total: number
  enviadoProveedorEn: Date | null
  creadoEn: Date
  localId: string
  localNombre: string
  creadoPorNombre: string
  tecnicoAsignadoNombre: string | null
  itemCount: number
}

function getRoleLabel(role: Rol) {
  switch (role) {
    case Rol.ADMIN:
      return "Administrador"
    case Rol.RECEPCION:
      return "Recepción"
    case Rol.TECNICO:
      return "Técnico"
    default:
      return "Usuario"
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() ?? "")
    .join("")
}

function buildPurchaseSuggestions(
  repuestos: Array<{
    id: string
    nombre: string
    sku: string | null
    stockActual: number
    stockMinimo: number
    precioCompra: unknown
    precioVenta: unknown
    localId: string
    proveedorId: string | null
    proveedor: {
      nombre: string
    } | null
    local: {
      nombre: string
    }
  }>
) {
  return repuestos
    .filter((repuesto) => repuesto.stockActual <= repuesto.stockMinimo)
    .map((repuesto) => {
      const quantityToOrder = Math.max(repuesto.stockMinimo * 2 - repuesto.stockActual, 1)
      const unitCost = Number(repuesto.precioCompra ?? repuesto.precioVenta ?? 0)

      return {
        id: repuesto.id,
        nombre: repuesto.nombre,
        sku: repuesto.sku,
        localId: repuesto.localId,
        localNombre: repuesto.local.nombre,
        proveedorId: repuesto.proveedorId,
        proveedorNombre: repuesto.proveedor?.nombre ?? null,
        stockActual: repuesto.stockActual,
        stockMinimo: repuesto.stockMinimo,
        quantityToOrder,
        estimatedCost: unitCost * quantityToOrder,
        urgency: repuesto.stockActual === 0 ? "critica" : "media",
      } satisfies PurchaseSuggestion
    })
    .sort((a, b) => {
      if (a.urgency !== b.urgency) {
        return a.urgency === "critica" ? -1 : 1
      }

      if (a.localNombre !== b.localNombre) {
        return a.localNombre.localeCompare(b.localNombre, "es")
      }

      return a.nombre.localeCompare(b.nombre, "es")
    })
}

function groupPurchaseSuggestions(
  locales: DashboardLocal[],
  purchaseSuggestions: PurchaseSuggestion[]
) {
  return locales
    .map((local) => {
      const items = purchaseSuggestions.filter((item) => item.localId === local.id)
      const totalEstimatedCost = items.reduce((sum, item) => sum + item.estimatedCost, 0)
      const criticalCount = items.filter((item) => item.urgency === "critica").length

      return {
        localId: local.id,
        localNombre: local.nombre,
        items,
        itemCount: items.length,
        criticalCount,
        totalEstimatedCost,
      } satisfies PurchaseSuggestionGroup
    })
    .filter((group) => group.itemCount > 0)
}

export const getDashboardContext = cache(async (): Promise<DashboardContext> => {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    include: {
      organizacion: true,
      locales: {
        include: {
          local: true,
        },
      },
    },
  })

  if (!usuario || !usuario.activo) {
    redirect("/login")
  }

  const locales = usuario.locales
    .filter((relation) => relation.local.activo)
    .sort((a, b) => {
      if (a.esPrincipal !== b.esPrincipal) {
        return a.esPrincipal ? -1 : 1
      }

      return a.local.nombre.localeCompare(b.local.nombre, "es")
    })
    .map((relation) => ({
      id: relation.local.id,
      nombre: relation.local.nombre,
      slug: relation.local.slug,
      esPrincipal: relation.esPrincipal,
    }))

  const localPrincipal = locales.find((local) => local.esPrincipal) ?? locales[0] ?? null

  return {
    user: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      rolLabel: getRoleLabel(usuario.rol),
      initials: getInitials(usuario.nombre),
      organizacionId: usuario.organizacionId,
    },
    organization: {
      id: usuario.organizacion.id,
      nombre: usuario.organizacion.nombre,
    },
    locales,
    localPrincipal,
  }
})

export const getDashboardOverview = cache(async () => {
  const context = await getDashboardContext()
  const localIds = context.locales.map((local) => local.id)

  if (localIds.length === 0) {
    return {
      context,
      stats: {
        assignedLocals: 0,
        teamSize: 0,
        openOrders: 0,
        readyForPickup: 0,
        lowStockCount: 0,
        criticalPurchaseCount: 0,
      },
      readyForPickupOrderId: null as string | null,
      readyForPickupOrderNumber: null as number | null,
      recentOrders: [],
      purchaseSuggestions: [] as PurchaseSuggestion[],
      purchaseSuggestionGroups: [] as PurchaseSuggestionGroup[],
    }
  }

  const [teamSize, openOrders, readyForPickup, recentOrdersRaw, repuestos, readyForPickupOrder] = await Promise.all([
    prisma.usuario.count({
      where: {
        organizacionId: context.organization.id,
        rol: Rol.TECNICO,
        activo: true,
      },
    }),
    prisma.ordenTrabajo.count({
      where: {
        localId: { in: localIds },
        estado: { notIn: [EstadoOT.ENTREGADO, EstadoOT.CANCELADO] },
      },
    }),
    prisma.ordenTrabajo.count({
      where: {
        localId: { in: localIds },
        estado: EstadoOT.LISTO_RETIRO,
      },
    }),
    prisma.ordenTrabajo.findMany({
      where: {
        localId: { in: localIds },
      },
      select: {
        id: true,
        numero: true,
        estado: true,
        falla: true,
        condicionIngreso: true,
        fechaIngreso: true,
        fechaCompromiso: true,
        clienteId: true,
        equipoId: true,
        localId: true,
        tecnicoId: true,
        cliente: {
          select: { nombre: true, email: true, telefono: true },
        },
        equipo: {
          select: { tipo: true, marca: true, modelo: true, numeroSerie: true },
        },
        tecnico: {
          select: { id: true, nombre: true },
        },
        local: {
          select: { nombre: true },
        },
      },
      orderBy: [{ fechaIngreso: "desc" }, { actualizadoEn: "desc" }],
      take: 8,
    }),
    prisma.repuesto.findMany({
      where: {
        localId: { in: localIds },
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        sku: true,
        stockActual: true,
        stockMinimo: true,
        precioCompra: true,
        precioVenta: true,
        localId: true,
        proveedorId: true,
        proveedor: {
          select: { nombre: true },
        },
        local: {
          select: { nombre: true },
        },
      },
    }),
    prisma.ordenTrabajo.findFirst({
      where: {
        localId: { in: localIds },
        estado: EstadoOT.LISTO_RETIRO,
      },
      select: {
        id: true,
        numero: true,
      },
      orderBy: [{ fechaIngreso: "desc" }, { actualizadoEn: "desc" }],
    }),
  ])

  const recentOrders = recentOrdersRaw.map((order) => ({
    ...order,
    fechaIngreso: order.fechaIngreso.toISOString(),
    fechaCompromiso: order.fechaCompromiso?.toISOString() ?? null,
  }))

  const purchaseSuggestions = buildPurchaseSuggestions(repuestos)

  return {
    context,
    stats: {
      assignedLocals: context.locales.length,
      teamSize,
      openOrders,
      readyForPickup,
      lowStockCount: purchaseSuggestions.length,
      criticalPurchaseCount: purchaseSuggestions.filter((item) => item.urgency === "critica").length,
    },
    readyForPickupOrderId: readyForPickupOrder?.id ?? null,
    readyForPickupOrderNumber: readyForPickupOrder?.numero ?? null,
    recentOrders,
    purchaseSuggestions,
    purchaseSuggestionGroups: groupPurchaseSuggestions(context.locales, purchaseSuggestions),
  }
})

export const getPurchaseOrdersPageData = cache(async () => {
  const overview = await getDashboardOverview()
  const localIds = overview.context.locales.map((local) => local.id)

  if (localIds.length === 0) {
    return {
      ...overview,
      purchaseOrders: [] as PurchaseOrderSummary[],
    }
  }

  const purchaseOrders = await prisma.ordenCompra.findMany({
    where: {
      localId: { in: localIds },
    },
    include: {
      local: {
        select: { nombre: true },
      },
      creadoPor: {
        select: { nombre: true },
      },
      proveedor: {
        select: {
          id: true,
          nombre: true,
          email: true,
        },
      },
      tecnicoAsignado: {
        select: { nombre: true },
      },
      items: {
        select: { id: true },
      },
    },
    orderBy: [{ creadoEn: "desc" }, { numero: "desc" }],
    take: 12,
  })

  return {
    ...overview,
    purchaseOrders: purchaseOrders.map((order) => ({
      id: order.id,
      numero: order.numero,
      estado: order.estado,
      proveedorId: order.proveedorId ?? null,
      proveedorNombre: order.proveedor?.nombre ?? order.proveedorNombre ?? null,
      proveedorEmail: order.proveedor?.email ?? null,
      nota: order.nota,
      total: Number(order.total),
      enviadoProveedorEn: order.enviadoProveedorEn ?? null,
      creadoEn: order.creadoEn,
      localId: order.localId,
      localNombre: order.local.nombre,
      creadoPorNombre: order.creadoPor.nombre,
      tecnicoAsignadoNombre: order.tecnicoAsignado?.nombre ?? null,
      itemCount: order.items.length,
    }) satisfies PurchaseOrderSummary),
  }
})
