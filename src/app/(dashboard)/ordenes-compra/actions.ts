"use server"

import { EstadoOrdenCompra } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import {
  getPurchaseOrderEmailConfigError,
  sendPurchaseOrderEmail,
} from "@/lib/purchase-order-email"
import { getDashboardContext } from "../dashboard-data"

export type CreatePurchaseOrderState = {
  error?: string
  success?: string
  refresh?: boolean
}

function toCurrencyValue(value: unknown) {
  return Number(value ?? 0)
}

export async function getTecnicos() {
  const context = await getDashboardContext()

  return prisma.usuario.findMany({
    where: {
      organizacionId: context.user.organizacionId,
      rol: "TECNICO",
      activo: true,
    },
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  })
}

export async function getProveedores() {
  const context = await getDashboardContext()

  return prisma.proveedor.findMany({
    where: {
      organizacionId: context.user.organizacionId,
      activo: true,
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      contactoNombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  })
}

export async function createPurchaseOrderAction(
  _prevState: CreatePurchaseOrderState,
  formData: FormData
): Promise<CreatePurchaseOrderState> {
  const localId = String(formData.get("localId") ?? "").trim()
  const proveedorId = String(formData.get("proveedorId") ?? "").trim()
  const nota = String(formData.get("nota") ?? "").trim()
  const tecnicoAsignadoId = String(formData.get("tecnicoAsignadoId") ?? "").trim()

  if (!localId) {
    return { error: "No pudimos identificar el local para crear la orden de compra." }
  }

  if (!proveedorId) {
    return { error: "Selecciona un proveedor para generar y enviar la orden de compra." }
  }

  const context = await getDashboardContext()
  const local = context.locales.find((item) => item.id === localId)

  if (!local) {
    return { error: "No tienes acceso a ese local." }
  }

  try {
    const configError = getPurchaseOrderEmailConfigError()

    if (configError) {
      return { error: configError }
    }

    const proveedor = await prisma.proveedor.findFirst({
      where: {
        id: proveedorId,
        organizacionId: context.organization.id,
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        contactoNombre: true,
      },
    })

    if (!proveedor) {
      return { error: "No encontramos ese proveedor dentro de tu organización." }
    }

    if (!proveedor.email) {
      return { error: "El proveedor seleccionado no tiene email configurado." }
    }

    const tecnicoAsignado = tecnicoAsignadoId
      ? await prisma.usuario.findFirst({
          where: {
            id: tecnicoAsignadoId,
            organizacionId: context.organization.id,
            rol: "TECNICO",
            activo: true,
          },
          select: {
            id: true,
            nombre: true,
          },
        })
      : null

    if (tecnicoAsignadoId && !tecnicoAsignado) {
      return { error: "No encontramos ese técnico dentro de tu organización." }
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      const repuestos = (await tx.repuesto.findMany({
        where: {
          localId,
          activo: true,
        },
        select: {
          id: true,
          nombre: true,
          stockActual: true,
          stockMinimo: true,
          precioCompra: true,
          precioVenta: true,
        },
        orderBy: [{ stockActual: "asc" }, { nombre: "asc" }],
      })).filter((repuesto) => repuesto.stockActual <= repuesto.stockMinimo)

      if (repuestos.length === 0) {
        throw new Error("No hay repuestos bajo stock mínimo para este local.")
      }

      const lastOrder = await tx.ordenCompra.findFirst({
        where: { localId },
        orderBy: { numero: "desc" },
        select: { numero: true },
      })

      const nextNumber = (lastOrder?.numero ?? 0) + 1
      const items = repuestos.map((repuesto) => {
        const quantity = Math.max(repuesto.stockMinimo * 2 - repuesto.stockActual, 1)
        const unitCost = toCurrencyValue(repuesto.precioCompra ?? repuesto.precioVenta)
        const subtotal = unitCost * quantity

        return {
          descripcion: repuesto.nombre,
          cantidad: quantity,
          costoUnitario: unitCost,
          subtotal,
          repuestoId: repuesto.id,
        }
      })

      const total = items.reduce((sum, item) => sum + item.subtotal, 0)

      return tx.ordenCompra.create({
        data: {
          numero: nextNumber,
          estado: EstadoOrdenCompra.BORRADOR,
          proveedorNombre: proveedor.nombre,
          proveedorId: proveedor.id,
          nota: nota || null,
          total,
          localId,
          creadoPorId: context.user.id,
          tecnicoAsignadoId: tecnicoAsignado?.id ?? null,
          items: {
            create: items,
          },
        },
        select: {
          id: true,
          numero: true,
          total: true,
          items: {
            select: {
              descripcion: true,
              cantidad: true,
              costoUnitario: true,
              subtotal: true,
            },
          },
        },
      })
    })

    const emailResult = await sendPurchaseOrderEmail({
      orderNumber: createdOrder.numero,
      provider: proveedor,
      localNombre: local.nombre,
      creadoPorNombre: context.user.nombre,
      tecnicoAsignadoNombre: tecnicoAsignado?.nombre ?? null,
      nota: nota || null,
      total: Number(createdOrder.total),
      items: createdOrder.items.map((item) => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        costoUnitario: toCurrencyValue(item.costoUnitario),
        subtotal: toCurrencyValue(item.subtotal),
      })),
    })

    if (!emailResult.ok) {
      revalidatePath("/")
      revalidatePath("/ordenes")

      return {
        error: `OC-${String(createdOrder.numero).padStart(4, "0")} creada en borrador, pero no pudimos enviar el correo al proveedor. ${emailResult.error}`,
        refresh: true,
      }
    }

    await prisma.ordenCompra.update({
      where: { id: createdOrder.id },
      data: {
        estado: EstadoOrdenCompra.ENVIADA,
        enviadoProveedorEn: new Date(),
      },
    })

    revalidatePath("/")
    revalidatePath("/ordenes")

    return {
      success: `OC-${String(createdOrder.numero).padStart(4, "0")} creada y enviada a ${proveedor.email}.`,
      refresh: true,
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }

    return { error: "No pudimos crear la orden de compra. Intenta nuevamente." }
  }
}
