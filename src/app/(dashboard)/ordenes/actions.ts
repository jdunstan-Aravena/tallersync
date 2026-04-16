"use server"

import { revalidatePath } from "next/cache"
import { TipoEquipo, type Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"

export type CreateWorkOrderState = {
  error?: string
  success?: string
}

function toDateValue(value: string) {
  return value ? new Date(value) : null
}

async function getOrCreateCliente(tx: Prisma.TransactionClient, nombre: string, email: string, telefono: string) {
  let cliente = await tx.cliente.findFirst({
    where: { email: email || undefined, nombre },
  })

  if (!cliente) {
    cliente = await tx.cliente.create({
      data: {
        nombre,
        email: email || null,
        telefono: telefono || null,
      },
    })
  }

  return cliente
}

async function getOrCreateEquipo(
  tx: Prisma.TransactionClient,
  clienteId: string,
  tipo: TipoEquipo,
  marca: string,
  modelo: string,
  numeroSerie: string
) {
  let equipo = await tx.equipo.findFirst({
    where: {
      clienteId,
      marca,
      modelo,
      numeroSerie: numeroSerie || undefined,
    },
  })

  if (!equipo) {
    equipo = await tx.equipo.create({
      data: {
        tipo,
        marca,
        modelo,
        numeroSerie: numeroSerie || null,
        clienteId,
      },
    })
  }

  return equipo
}

export async function saveWorkOrderAction(
  _prevState: CreateWorkOrderState,
  formData: FormData
): Promise<CreateWorkOrderState> {
  const orderId = String(formData.get("orderId") ?? "").trim()
  const localId = String(formData.get("localId") ?? "").trim()
  const clienteNombre = String(formData.get("clienteNombre") ?? "").trim()
  const clienteEmail = String(formData.get("clienteEmail") ?? "").trim()
  const clienteTelefono = String(formData.get("clienteTelefono") ?? "").trim()
  const equipoTipo = String(formData.get("equipoTipo") ?? "").trim()
  const equipoMarca = String(formData.get("equipoMarca") ?? "").trim()
  const equipoModelo = String(formData.get("equipoModelo") ?? "").trim()
  const equipoSerie = String(formData.get("equipoSerie") ?? "").trim()
  const tecnicoId = String(formData.get("tecnicoId") ?? "").trim()
  const falla = String(formData.get("falla") ?? "").trim()
  const condicionIngreso = String(formData.get("condicionIngreso") ?? "").trim()
  const fechaCompromiso = String(formData.get("fechaCompromiso") ?? "").trim()

  if (!localId) {
    return { error: "No pudimos identificar el local para guardar la orden." }
  }

  if (!clienteNombre) {
    return { error: "El nombre del cliente es requerido." }
  }

  if (!equipoTipo) {
    return { error: "El tipo de equipo es requerido." }
  }

  if (!equipoMarca) {
    return { error: "La marca del equipo es requerida." }
  }

  if (!equipoModelo) {
    return { error: "El modelo del equipo es requerido." }
  }

  if (!falla) {
    return { error: "La descripción de la falla es requerida." }
  }

  const validTipos = Object.values(TipoEquipo)
  if (!validTipos.includes(equipoTipo as TipoEquipo)) {
    return { error: "Tipo de equipo no válido." }
  }

  const context = await getDashboardContext()
  const local = context.locales.find((item) => item.id === localId)

  if (!local) {
    return { error: "No tienes acceso a ese local." }
  }

  try {
    const savedOrder = await prisma.$transaction(async (tx) => {
      const cliente = await getOrCreateCliente(tx, clienteNombre, clienteEmail, clienteTelefono)
      const equipo = await getOrCreateEquipo(
        tx,
        cliente.id,
        equipoTipo as TipoEquipo,
        equipoMarca,
        equipoModelo,
        equipoSerie
      )

      if (orderId) {
        const existingOrder = await tx.ordenTrabajo.findUnique({
          where: { id: orderId },
          select: { id: true, numero: true, localId: true },
        })

        if (!existingOrder) {
          throw new Error("Orden de trabajo no encontrada.")
        }

        if (!context.locales.some((item) => item.id === existingOrder.localId)) {
          throw new Error("No tienes acceso a esa orden.")
        }

        let nextNumber = existingOrder.numero
        if (existingOrder.localId !== localId) {
          const lastOrder = await tx.ordenTrabajo.findFirst({
            where: { localId },
            orderBy: { numero: "desc" },
            select: { numero: true },
          })
          nextNumber = (lastOrder?.numero ?? 0) + 1
        }

        return tx.ordenTrabajo.update({
          where: { id: orderId },
          data: {
            numero: nextNumber,
            falla,
            condicionIngreso: condicionIngreso || null,
            fechaCompromiso: fechaCompromiso ? toDateValue(fechaCompromiso) : null,
            clienteId: cliente.id,
            equipoId: equipo.id,
            localId,
            tecnicoId: tecnicoId || null,
          },
          select: { numero: true },
        })
      }

      const lastOrder = await tx.ordenTrabajo.findFirst({
        where: { localId },
        orderBy: { numero: "desc" },
        select: { numero: true },
      })

      const nextNumber = (lastOrder?.numero ?? 0) + 1

      return tx.ordenTrabajo.create({
        data: {
          numero: nextNumber,
          falla,
          condicionIngreso: condicionIngreso || null,
          fechaCompromiso: fechaCompromiso ? toDateValue(fechaCompromiso) : null,
          clienteId: cliente.id,
          equipoId: equipo.id,
          localId,
          creadoPorId: context.user.id,
          tecnicoId: tecnicoId || null,
        },
        select: { numero: true },
      })
    })

    revalidatePath("/")
    revalidatePath("/ordenes")
    revalidatePath("/agenda")

    const actionLabel = orderId ? "actualizada" : "creada"
    return { success: `Orden de trabajo #${String(savedOrder.numero).padStart(4, "0")} ${actionLabel} exitosamente.` }
  } catch (error) {
    console.error("Error guardando orden de trabajo:", error)
    return { error: "Error al guardar la orden de trabajo. Intenta nuevamente." }
  }
}

export async function deleteWorkOrderAction(
  _prevState: CreateWorkOrderState,
  formData: FormData
): Promise<CreateWorkOrderState> {
  const orderId = String(formData.get("orderId") ?? "").trim()

  if (!orderId) {
    return { error: "No pudimos identificar la orden para eliminar." }
  }

  const context = await getDashboardContext()

  const order = await prisma.ordenTrabajo.findUnique({
    where: { id: orderId },
    select: { localId: true },
  })

  if (!order) {
    return { error: "Orden de trabajo no encontrada." }
  }

  if (!context.locales.some((item) => item.id === order.localId)) {
    return { error: "No tienes acceso a esa orden." }
  }

  try {
    await prisma.ordenTrabajo.delete({
      where: { id: orderId },
    })

    revalidatePath("/")
    revalidatePath("/ordenes")
    revalidatePath("/agenda")

    return { success: "Orden de trabajo eliminada correctamente." }
  } catch (error) {
    console.error("Error eliminando orden de trabajo:", error)
    return { error: "Error al eliminar la orden de trabajo. Intenta nuevamente." }
  }
}
