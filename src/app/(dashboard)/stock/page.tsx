import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"
import StockForm from "./StockForm"
import { auth } from "@/auth"

const getStocks = cache(async () => {
  try {
    const context = await getDashboardContext()
    const localId = context.localPrincipal?.id

    if (!localId) return []

    const stocks = await prisma.repuesto.findMany({
      where: {
        localId,
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        sku: true,
        descripcion: true,
        precioCompra: true,
        precioVenta: true,
        stockActual: true,
        stockMinimo: true,
        activo: true,
        creadoEn: true,
        categoriaId: true,
        categoria: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        creadoEn: "desc",
      },
    })

    return stocks.map((stock) => ({
      ...stock,
      precioCompra: stock.precioCompra?.toString() ?? null,
      precioVenta: stock.precioVenta.toString(),
      creadoEn: stock.creadoEn.toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching stocks:", error)
    return []
  }
})

const getCategorias = cache(async () => {
  try {
    const session = await auth()
    if (!session?.user?.organizacionId) return []

    const categorias = await prisma.categoriaRepuesto.findMany({
      where: {
        organizacionId: session.user.organizacionId,
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

    return categorias
  } catch (error) {
    console.error("Error fetching categorias:", error)
    return []
  }
})

export default async function StockPage() {
  const stocks = await getStocks()
  const categorias = await getCategorias()

  return (
    <div>
      <div style={{ marginBottom: "var(--spacing-2xl)" }}>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600 }}>
          Gestión de inventario
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--color-text-tertiary)" }}>
          Administra el inventario de repuestos disponibles.
        </p>
      </div>

      <StockForm stocks={stocks} categorias={categorias} />
    </div>
  )
}
