"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"

export type TechnicianActionState = {
  error?: string
  success?: string
}

export async function saveTechnicianAction(
  _prevState: TechnicianActionState,
  formData: FormData
): Promise<TechnicianActionState> {
  const technicianId = String(formData.get("technicianId") ?? "").trim()
  const nombre = String(formData.get("nombre") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "").trim()

  if (!nombre || !email) {
    return { error: "El nombre y email del técnico son requeridos." }
  }

  try {
    const context = await getDashboardContext()

    if (technicianId) {
      // Actualizar técnico existente
      const updateData: any = {
        nombre,
        email,
      }

      // Si se proporciona contraseña, actualizar
      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 12)
      }

      await prisma.usuario.update({
        where: { id: technicianId },
        data: updateData,
      })

      revalidatePath("/tecnicos")
      return { success: "Técnico actualizado correctamente." }
    }

    // Crear nuevo técnico
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "Ya existe un usuario con este email." }
    }

    if (!password || password.length < 8) {
      return { error: "La contraseña debe tener al menos 8 caracteres." }
    }

    const newTechnician = await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        rol: "TECNICO",
        organizacionId: context.organization.id,
      },
    })

    // Asignar al local principal por defecto
    if (context.localPrincipal) {
      await prisma.usuarioLocal.create({
        data: {
          usuarioId: newTechnician.id,
          localId: context.localPrincipal.id,
          esPrincipal: true,
        },
      })
    }

    revalidatePath("/tecnicos")
    return { success: "Técnico creado correctamente." }
  } catch (error) {
    console.error("Error guardando técnico:", error)
    return { error: "Error al guardar el técnico. Intenta nuevamente." }
  }
}

export async function deleteTechnicianAction(
  _prevState: TechnicianActionState,
  formData: FormData
): Promise<TechnicianActionState> {
  const technicianId = String(formData.get("technicianId") ?? "").trim()

  if (!technicianId) {
    return { error: "No pudimos identificar el técnico para eliminar." }
  }

  try {
    // Desasignar de órdenes primero
    await prisma.ordenTrabajo.updateMany({
      where: { tecnicoId: technicianId },
      data: { tecnicoId: null },
    })

    // Eliminar relaciones de usuario-local
    await prisma.usuarioLocal.deleteMany({
      where: { usuarioId: technicianId },
    })

    // Eliminar técnico
    await prisma.usuario.delete({
      where: { id: technicianId },
    })

    revalidatePath("/tecnicos")
    return { success: "Técnico eliminado correctamente." }
  } catch (error) {
    console.error("Error eliminando técnico:", error)
    return { error: "Error al eliminar el técnico. Intenta nuevamente." }
  }
}
