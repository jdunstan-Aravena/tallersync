"use server"

import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export type RegisterState = {
  error?: string
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function buildUniqueLocalSlug(baseName: string) {
  const baseSlug = slugify(baseName) || "local-principal"
  let candidate = baseSlug
  let counter = 2

  while (await prisma.local.findUnique({ where: { slug: candidate } })) {
    candidate = `${baseSlug}-${counter}`
    counter += 1
  }

  return candidate
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const nombre = String(formData.get("nombre") ?? "").trim()
  const organizacion = String(formData.get("organizacion") ?? "").trim()
  const local = String(formData.get("local") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")
  const callbackUrl = String(formData.get("callbackUrl") ?? "/").trim() || "/"

  if (!nombre || !organizacion || !local || !email || !password || !confirmPassword) {
    return { error: "Completa todos los campos para crear tu cuenta." }
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." }
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." }
  }

  const existingUser = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    return { error: "Ya existe una cuenta con ese email." }
  }

  try {
    const localSlug = await buildUniqueLocalSlug(local)
    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.$transaction(async (tx) => {
      const nuevaOrganizacion = await tx.organizacion.create({
        data: {
          nombre: organizacion,
          plan: "FREE",
        },
      })

      const nuevoLocal = await tx.local.create({
        data: {
          nombre: local,
          slug: localSlug,
          email,
          organizacionId: nuevaOrganizacion.id,
        },
      })

      const nuevoUsuario = await tx.usuario.create({
        data: {
          nombre,
          email,
          passwordHash,
          rol: "ADMIN",
          organizacionId: nuevaOrganizacion.id,
        },
      })

      await tx.usuarioLocal.create({
        data: {
          usuarioId: nuevoUsuario.id,
          localId: nuevoLocal.id,
          esPrincipal: true,
        },
      })
    })
  } catch {
    return { error: "No pudimos crear tu cuenta en este momento. Intenta nuevamente." }
  }

  const loginUrl = new URLSearchParams({
    registered: "1",
    callbackUrl,
  })

  redirect(`/login?${loginUrl.toString()}`)
}
