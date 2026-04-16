"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"

export type StockActionState = {
  error?: string
  success?: string
}

export async function saveStockAction(
  _prevState: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const stockId = String(formData.get("stockId") ?? "").trim()
  const nombre = String(formData.get("nombre") ?? "").trim()
  const sku = String(formData.get("sku") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim()
  const precioCompra = String(formData.get("precioCompra") ?? "").trim()
  const precioVenta = String(formData.get("precioVenta") ?? "").trim()
  const stockActual = String(formData.get("stockActual") ?? "").trim()
  const stockMinimo = String(formData.get("stockMinimo") ?? "").trim()
  const categoriaId = String(formData.get("categoriaId") ?? "").trim()

  if (!nombre || !precioVenta) {
    return { error: "El nombre y precio de venta son requeridos." }
  }

  try {
    const context = await getDashboardContext()
    const localId = context.localPrincipal?.id

    if (!localId) {
      return { error: "No pudimos identificar tu local principal." }
    }

    const precioVentaDecimal = parseFloat(precioVenta)
    const precioCompraDecimal = precioCompra ? parseFloat(precioCompra) : null
    const stockActualInt = parseInt(stockActual || "0")
    const stockMinimoInt = parseInt(stockMinimo || "1")

    if (stockId) {
      // Actualizar
      await prisma.repuesto.update({
        where: { id: stockId },
        data: {
          nombre,
          sku: sku || null,
          descripcion: descripcion || null,
          precioCompra: precioCompraDecimal,
          precioVenta: precioVentaDecimal,
          stockActual: stockActualInt,
          stockMinimo: stockMinimoInt,
          categoriaId: categoriaId || null,
        },
      })

      revalidatePath("/stock")
      return { success: "Repuesto actualizado correctamente." }
    }

    // Crear
    await prisma.repuesto.create({
      data: {
        nombre,
        sku: sku || null,
        descripcion: descripcion || null,
        precioCompra: precioCompraDecimal,
        precioVenta: precioVentaDecimal,
        stockActual: stockActualInt,
        stockMinimo: stockMinimoInt,
        localId,
        categoriaId: categoriaId || null,
      },
    })

    revalidatePath("/stock")
    return { success: "Repuesto creado correctamente." }
  } catch (error) {
    console.error("Error guardando repuesto:", error)
    return { error: "Error al guardar el repuesto. Intenta nuevamente." }
  }
}

export async function deleteStockAction(
  _prevState: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  const stockId = String(formData.get("stockId") ?? "").trim()

  if (!stockId) {
    return { error: "No pudimos identificar el repuesto para eliminar." }
  }

  try {
    await prisma.repuesto.delete({
      where: { id: stockId },
    })

    revalidatePath("/stock")
    return { success: "Repuesto eliminado correctamente." }
  } catch (error) {
    console.error("Error eliminando repuesto:", error)
    return { error: "Error al eliminar el repuesto. Intenta nuevamente." }
  }
}
