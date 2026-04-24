"use client"

import { useActionState, useEffect, useEffectEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import { saveStockAction, deleteStockAction, type StockActionState } from "./actions"

type StockItem = {
  id: string
  nombre: string
  sku?: string | null
  descripcion?: string | null
  precioCompra?: string | null
  precioVenta: string
  stockActual: number
  stockMinimo: number
  activo: boolean
  creadoEn: string
  categoriaId?: string | null
  proveedorId?: string | null
  categoria?: {
    id: string
    nombre: string
  } | null
  proveedor?: {
    id: string
    nombre: string
  } | null
}

type Categoria = {
  id: string
  nombre: string
}

type Provider = {
  id: string
  nombre: string
}

type StockFormProps = {
  stocks: StockItem[]
  categorias: Categoria[]
  providers: Provider[]
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="btn btn-primary" disabled={pending} style={{ width: "100%" }}>
      {pending ? (editing ? "Guardando..." : "Creando repuesto...") : editing ? "Guardar cambios" : "Crear repuesto"}
    </button>
  )
}

const initialState: StockActionState = {}

export default function StockForm({ stocks, categorias, providers }: StockFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(saveStockAction, initialState)
  const [deleteState, deleteAction] = useActionState(deleteStockAction, initialState)
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null)
  const handleMutationSuccess = useEffectEvent(() => {
    router.refresh()
    setSelectedStock(null)
  })

  useEffect(() => {
    if (state.success || deleteState.success) {
      handleMutationSuccess()
    }
  }, [state.success, deleteState.success])

  const isEditing = Boolean(selectedStock)
  const formKey = selectedStock?.id ?? "new"

  return (
    <div style={{ display: "grid", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-2xl)" }}>
      <div className="card" style={{ padding: 0 }}>
        <div style={{
          padding: "var(--spacing-lg) var(--spacing-xl)",
          borderBottom: "0.5px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--spacing-md)",
          flexWrap: "wrap",
        }}>
          <div>
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: 500, margin: 0 }}>
              {isEditing ? "Editar repuesto" : "Crear nuevo repuesto"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              {isEditing ? "Actualiza los datos o presiona Limpiar para empezar." : "Registra un nuevo repuesto en el inventario."}
            </p>
          </div>
        </div>

        <form key={formKey} action={formAction} style={{ padding: "var(--spacing-xl)", display: "grid", gap: "var(--spacing-lg)" }}>
          {isEditing && <input type="hidden" name="stockId" value={selectedStock?.id ?? ""} />}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--spacing-md)" }}>
            <div>
              <label className="form-label" htmlFor="nombre">
                Nombre *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className={`input ${state.error?.includes("nombre") ? "input-error" : ""}`}
                placeholder="Pantalla LCD"
                defaultValue={selectedStock?.nombre ?? ""}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="sku">
                SKU
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                className="input"
                placeholder="SKU-001234"
                defaultValue={selectedStock?.sku ?? ""}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="precioCompra">
                Precio de compra
              </label>
              <input
                id="precioCompra"
                name="precioCompra"
                type="number"
                step="0.01"
                className="input"
                placeholder="50.00"
                defaultValue={selectedStock?.precioCompra ?? ""}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="precioVenta">
                Precio de venta *
              </label>
              <input
                id="precioVenta"
                name="precioVenta"
                type="number"
                step="0.01"
                className={`input ${state.error?.includes("venta") ? "input-error" : ""}`}
                placeholder="99.99"
                defaultValue={selectedStock?.precioVenta ?? ""}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="stockActual">
                Stock actual
              </label>
              <input
                id="stockActual"
                name="stockActual"
                type="number"
                className="input"
                placeholder="5"
                defaultValue={selectedStock?.stockActual ?? "0"}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="stockMinimo">
                Stock mínimo
              </label>
              <input
                id="stockMinimo"
                name="stockMinimo"
                type="number"
                className="input"
                placeholder="1"
                defaultValue={selectedStock?.stockMinimo ?? "1"}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="categoriaId">
                Categoría
              </label>
              <select
                id="categoriaId"
                name="categoriaId"
                className="input"
                defaultValue={selectedStock?.categoriaId ?? ""}
              >
                <option value="">Sin categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="proveedorId">
                Proveedor habitual
              </label>
              <select
                id="proveedorId"
                name="proveedorId"
                className="input"
                defaultValue={selectedStock?.proveedorId ?? ""}
              >
                <option value="">Sin proveedor</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="descripcion">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="textarea"
              placeholder="Descripción detallada del repuesto..."
              style={{ minHeight: 88 }}
              defaultValue={selectedStock?.descripcion ?? ""}
            />
          </div>

          {state.error && (
            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgb(239, 68, 68)", borderRadius: "var(--radius-md)", padding: "var(--spacing-md)" }}>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "rgb(220, 38, 38)" }}>{state.error}</p>
            </div>
          )}

          {state.success && (
            <div style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", border: "1px solid rgb(34, 197, 94)", borderRadius: "var(--radius-md)", padding: "var(--spacing-md)" }}>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "rgb(22, 163, 74)" }}>{state.success}</p>
            </div>
          )}

          {deleteState.error && (
            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgb(239, 68, 68)", borderRadius: "var(--radius-md)", padding: "var(--spacing-md)" }}>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "rgb(220, 38, 38)" }}>{deleteState.error}</p>
            </div>
          )}

          {deleteState.success && (
            <div style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", border: "1px solid rgb(34, 197, 94)", borderRadius: "var(--radius-md)", padding: "var(--spacing-md)" }}>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "rgb(22, 163, 74)" }}>{deleteState.success}</p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--spacing-sm)" }}>
            <div>
              <SubmitButton editing={isEditing} />
            </div>
            <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setSelectedStock(null)}>
              Limpiar
            </button>
            <div />
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{
          padding: "var(--spacing-lg) var(--spacing-xl)",
          borderBottom: "0.5px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--spacing-md)",
          flexWrap: "wrap",
        }}>
          <div>
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: 500, margin: 0 }}>
              Inventario
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Haz clic en un repuesto para editar o eliminar.
            </p>
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {stocks.length} artículo(s)
          </span>
        </div>

        {stocks.length > 0 ? (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>SKU</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Mínimo</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => {
                  const stockStatus = stock.stockActual <= stock.stockMinimo ? "⚠️ Bajo" : "✅ Disponible"
                  return (
                    <tr
                      key={stock.id}
                      onClick={() => setSelectedStock(stock)}
                      style={{ cursor: "pointer", backgroundColor: selectedStock?.id === stock.id ? "rgba(59, 130, 246, 0.08)" : undefined }}
                    >
                      <td style={{ fontWeight: 500 }}>{stock.nombre}</td>
                      <td style={{ color: "var(--color-text-tertiary)", fontSize: "0.875rem" }}>{stock.sku ?? "-"}</td>
                      <td style={{ color: "var(--color-text-tertiary)", fontSize: "0.875rem" }}>
                        {stock.categoria?.nombre ?? "-"}
                      </td>
                      <td style={{ color: "var(--color-text-tertiary)", fontSize: "0.875rem" }}>
                        {stock.proveedor?.nombre ?? "-"}
                      </td>
                      <td style={{ color: "var(--color-text-tertiary)" }}>
                        ${parseFloat(stock.precioVenta).toFixed(2)}
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{stock.stockActual}</span>
                      </td>
                      <td>{stock.stockMinimo}</td>
                      <td>{stockStatus}</td>
                      <td>
                        <form action={deleteAction} style={{ display: "inline" }}>
                          <input type="hidden" name="stockId" value={stock.id} />
                          <button
                            type="submit"
                            className="btn btn-ghost"
                            style={{ padding: "0.4rem 0.7rem" }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            🗑️
                          </button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No hay repuestos en inventario</div>
            <div className="empty-state-desc">
              Crea tu primer repuesto usando el formulario anterior.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
