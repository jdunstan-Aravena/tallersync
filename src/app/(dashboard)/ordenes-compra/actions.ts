"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"

export type CreatePurchaseOrderState = {
  error?: string
  success?: string
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

export async function createPurchaseOrderAction(
  _prevState: CreatePurchaseOrderState,
  formData: FormData
): Promise<CreatePurchaseOrderState> {
  const localId = String(formData.get("localId") ?? "").trim()
  const proveedor = String(formData.get("proveedor") ?? "").trim()
  const nota = String(formData.get("nota") ?? "").trim()
  const tecnicoAsignadoId = String(formData.get("tecnicoAsignadoId") ?? "").trim()

  if (!localId) {
    return { error: "No pudimos identificar el local para crear la orden de compra." }
  }

  const context = await getDashboardContext()
  const local = context.locales.find((item) => item.id === localId)

  if (!local) {
    return { error: "No tienes acceso a ese local." }
  }

  try {
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
          proveedor: proveedor || null,
          nota: nota || null,
          total,
          localId,
          creadoPorId: context.user.id,
          tecnicoAsignadoId: tecnicoAsignadoId || null,
          items: {
            create: items,
          },
        },
        select: {
          numero: true,
        },
      })
    })

    revalidatePath("/")
    revalidatePath("/ordenes")

    return {
      success: `OC-${String(createdOrder.numero).padStart(4, "0")} creada correctamente para ${local.nombre}.`,
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }

    return { error: "No pudimos crear la orden de compra. Intenta nuevamente." }
  }
}
