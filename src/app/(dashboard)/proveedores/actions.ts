"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"

export type ProviderActionState = {
  error?: string
  success?: string
}

export async function saveProviderAction(
  _prevState: ProviderActionState,
  formData: FormData
): Promise<ProviderActionState> {
  const providerId = String(formData.get("providerId") ?? "").trim()
  const nombre = String(formData.get("nombre") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const telefono = String(formData.get("telefono") ?? "").trim()
  const contactoNombre = String(formData.get("contactoNombre") ?? "").trim()
  const direccion = String(formData.get("direccion") ?? "").trim()
  const notas = String(formData.get("notas") ?? "").trim()
  const activo = String(formData.get("activo") ?? "").trim() === "on"

  if (!nombre || !email) {
    return { error: "El nombre y email del proveedor son requeridos." }
  }

  try {
    const context = await getDashboardContext()

    if (providerId) {
      const result = await prisma.proveedor.updateMany({
        where: {
          id: providerId,
          organizacionId: context.organization.id,
        },
        data: {
          nombre,
          email,
          telefono: telefono || null,
          contactoNombre: contactoNombre || null,
          direccion: direccion || null,
          notas: notas || null,
          activo,
        },
      })

      if (result.count === 0) {
        return { error: "No encontramos ese proveedor dentro de tu organización." }
      }

      revalidatePath("/proveedores")
      revalidatePath("/ordenes")
      revalidatePath("/stock")
      return { success: "Proveedor actualizado correctamente." }
    }

    await prisma.proveedor.create({
      data: {
        nombre,
        email,
        telefono: telefono || null,
        contactoNombre: contactoNombre || null,
        direccion: direccion || null,
        notas: notas || null,
        activo,
        organizacionId: context.organization.id,
      },
    })

    revalidatePath("/proveedores")
    revalidatePath("/ordenes")
    revalidatePath("/stock")
    return { success: "Proveedor creado correctamente." }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Ya existe un proveedor con ese nombre en tu organización." }
    }

    console.error("Error guardando proveedor:", error)
    return { error: "Error al guardar el proveedor. Intenta nuevamente." }
  }
}
