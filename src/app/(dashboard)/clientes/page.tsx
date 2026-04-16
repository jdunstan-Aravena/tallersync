import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"
import ClientForm from "./ClientForm"

const getClients = cache(async () => {
  try {
    await getDashboardContext()

    const clients = await prisma.cliente.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        rut: true,
        notas: true,
        creadoEn: true,
      },
      orderBy: {
        creadoEn: "desc",
      },
    })

    return clients.map((client) => ({
      ...client,
      creadoEn: client.creadoEn.toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
})

export default async function ClientesPage() {
  const clients = await getClients()

  return (
    <div>
      <div style={{ marginBottom: "var(--spacing-2xl)" }}>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600 }}>
          Gestión de clientes
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--color-text-tertiary)" }}>
          Crea, edita y gestiona la información de tus clientes.
        </p>
      </div>

      <ClientForm clients={clients} />
    </div>
  )
}
