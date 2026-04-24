import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"
import ProviderForm from "./ProviderForm"

const getProviders = cache(async () => {
  const context = await getDashboardContext()

  const providers = await prisma.proveedor.findMany({
    where: {
      organizacionId: context.organization.id,
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      telefono: true,
      contactoNombre: true,
      direccion: true,
      notas: true,
      activo: true,
      creadoEn: true,
      _count: {
        select: {
          repuestos: true,
          ordenesCompra: true,
        },
      },
    },
    orderBy: [{ activo: "desc" }, { nombre: "asc" }],
  })

  return providers.map((provider) => ({
    ...provider,
    creadoEn: provider.creadoEn.toISOString(),
    repuestosCount: provider._count.repuestos,
    ordenesCompraCount: provider._count.ordenesCompra,
  }))
})

export default async function ProveedoresPage() {
  const providers = await getProviders()

  return (
    <div>
      <div style={{ marginBottom: "var(--spacing-2xl)" }}>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600 }}>
          Gestión de proveedores
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--color-text-tertiary)" }}>
          Mantén el catálogo de proveedores para vincularlos a repuestos y enviarles órdenes de compra.
        </p>
      </div>

      <ProviderForm providers={providers} />
    </div>
  )
}
