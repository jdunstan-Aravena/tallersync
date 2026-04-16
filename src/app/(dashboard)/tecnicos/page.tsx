import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"
import TechnicianForm from "./TechnicianForm"

const getTechnicians = cache(async () => {
  try {
    await getDashboardContext()

    const technicians = await prisma.usuario.findMany({
      where: {
        rol: "TECNICO",
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        creadoEn: true,
      },
      orderBy: {
        creadoEn: "desc",
      },
    })

    return technicians.map((tech) => ({
      ...tech,
      creadoEn: tech.creadoEn.toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching technicians:", error)
    return []
  }
})

export default async function TecnicosPage() {
  const technicians = await getTechnicians()

  return (
    <div>
      <div style={{ marginBottom: "var(--spacing-2xl)" }}>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600 }}>
          Gestión de técnicos
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--color-text-tertiary)" }}>
          Crea, edita y gestiona los técnicos disponibles para asignar a órdenes de trabajo.
        </p>
      </div>

      <TechnicianForm technicians={technicians} />
    </div>
  )
}
