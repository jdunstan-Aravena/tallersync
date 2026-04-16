import type { EstadoOrdenCompra } from "@prisma/client"

export type PurchaseOrderItemTemplate = {
  descripcion: string
  cantidad: number
  costoUnitario: number
  subtotal: number
}

export type PurchaseOrderTemplateProps = {
  numero: number
  estado: EstadoOrdenCompra
  proveedor?: string | null
  nota?: string | null
  total: number
  creadoEn: string
  localNombre: string
  creadoPorNombre: string
  items: PurchaseOrderItemTemplate[]
}

export default function PurchaseOrderTemplate({
  numero,
  estado,
  proveedor,
  nota,
  total,
  creadoEn,
  localNombre,
  creadoPorNombre,
  items,
}: PurchaseOrderTemplateProps) {
  return (
    <article style={{ padding: "24px", fontFamily: "Inter, sans-serif", color: "#111827", lineHeight: 1.5 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Orden de Compra</p>
          <h1 style={{ margin: "8px 0 0", fontSize: "1.75rem" }}>OC-{String(numero).padStart(4, "0")}</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#6B7280" }}>Estado</p>
          <strong style={{ display: "block", marginTop: "4px", fontSize: "1rem" }}>{estado}</strong>
        </div>
      </header>

      <section style={{ marginBottom: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Local</p>
          <p style={{ margin: "6px 0 0", fontSize: "0.95rem" }}>{localNombre}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Creada por</p>
          <p style={{ margin: "6px 0 0", fontSize: "0.95rem" }}>{creadoPorNombre}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Fecha</p>
          <p style={{ margin: "6px 0 0", fontSize: "0.95rem" }}>{new Date(creadoEn).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Proveedor</p>
          <p style={{ margin: "6px 0 0", fontSize: "0.95rem" }}>{proveedor ?? "No especificado"}</p>
        </div>
      </section>

      {nota && (
        <section style={{ marginBottom: "24px" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Nota interna</p>
          <p style={{ margin: "8px 0 0", fontSize: "0.95rem" }}>{nota}</p>
        </section>
      )}

      <section style={{ marginBottom: "24px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "12px", borderBottom: "2px solid #E5E7EB" }}>Descripción</th>
              <th style={{ textAlign: "right", padding: "12px", borderBottom: "2px solid #E5E7EB" }}>Cantidad</th>
              <th style={{ textAlign: "right", padding: "12px", borderBottom: "2px solid #E5E7EB" }}>Costo unitario</th>
              <th style={{ textAlign: "right", padding: "12px", borderBottom: "2px solid #E5E7EB" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: "12px 12px 12px 0", borderBottom: "1px solid #E5E7EB" }}>{item.descripcion}</td>
                <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #E5E7EB" }}>{item.cantidad}</td>
                <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #E5E7EB" }}>{item.costoUnitario.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}</td>
                <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #E5E7EB" }}>{item.subtotal.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "0.9rem", color: "#6B7280" }}>
          <p style={{ margin: 0 }}>Documento preparado para impresión</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Total</p>
          <strong style={{ fontSize: "1.25rem" }}>{total.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}</strong>
        </div>
      </footer>
    </article>
  )
}
