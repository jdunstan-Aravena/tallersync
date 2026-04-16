"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"

export type ClientActionState = {
  error?: string
  success?: string
}

export async function saveClientAction(
  _prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const clientId = String(formData.get("clientId") ?? "").trim()
  const nombre = String(formData.get("nombre") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const telefono = String(formData.get("telefono") ?? "").trim()
  const rut = String(formData.get("rut") ?? "").trim()
  const notas = String(formData.get("notas") ?? "").trim()

  if (!nombre) {
    return { error: "El nombre del cliente es requerido." }
  }

  try {
    const context = await getDashboardContext()

    if (clientId) {
      await prisma.cliente.update({
        where: { id: clientId },
        data: {
          nombre,
          email: email || null,
          telefono: telefono || null,
          rut: rut || null,
          notas: notas || null,
        },
      })

      revalidatePath("/clientes")
      return { success: "Cliente actualizado correctamente." }
    }

    await prisma.cliente.create({
      data: {
        nombre,
        email: email || null,
        telefono: telefono || null,
        rut: rut || null,
        notas: notas || null,
      },
    })

    revalidatePath("/clientes")
    return { success: "Cliente creado correctamente." }
  } catch (error) {
    console.error("Error guardando cliente:", error)
    return { error: "Error al guardar el cliente. Intenta nuevamente." }
  }
}

export async function deleteClientAction(
  _prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const clientId = String(formData.get("clientId") ?? "").trim()

  if (!clientId) {
    return { error: "No pudimos identificar el cliente para eliminar." }
  }

  try {
    await prisma.cliente.delete({
      where: { id: clientId },
    })

    revalidatePath("/clientes")
    return { success: "Cliente eliminado correctamente." }
  } catch (error) {
    console.error("Error eliminando cliente:", error)
    return { error: "Error al eliminar el cliente. Intenta nuevamente." }
  }
}
