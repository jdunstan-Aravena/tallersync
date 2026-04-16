import type { EstadoOT } from "@prisma/client"

export type WorkOrderTemplateProps = {
  numero: number
  estado: EstadoOT
  falla: string
  diagnostico?: string | null
  solucion?: string | null
  condicionIngreso?: string | null
  fechaIngreso: string
  fechaCompromiso?: string | null
  fechaEntrega?: string | null
  localNombre: string
  clienteNombre: string
  clienteEmail?: string | null
  clienteTelefono?: string | null
  equipoTipo: string
  equipoMarca: string
  equipoModelo: string
  equipoSerie?: string | null
  tecnicoNombre?: string | null
}

export default function WorkOrderTemplate({
  numero,
  estado,
  falla,
  diagnostico,
  solucion,
  condicionIngreso,
  fechaIngreso,
  fechaCompromiso,
  fechaEntrega,
  localNombre,
  clienteNombre,
  clienteEmail,
  clienteTelefono,
  equipoTipo,
  equipoMarca,
  equipoModelo,
  equipoSerie,
  tecnicoNombre,
}: WorkOrderTemplateProps) {
  return (
    <article style={{ padding: "24px", fontFamily: "Inter, sans-serif", color: "#111827", lineHeight: 1.6 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Orden de Trabajo</p>
          <h1 style={{ margin: "8px 0 0", fontSize: "1.75rem" }}>OT-{String(numero).padStart(4, "0")}</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Estado</p>
          <strong style={{ display: "block", marginTop: "4px", fontSize: "1rem" }}>{estado}</strong>
        </div>
      </header>

      <section style={{ marginBottom: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div>
          <h3 style={{ margin: "0 0 12px", fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Cliente</h3>
          <p style={{ margin: "6px 0", fontSize: "0.95rem", fontWeight: 500 }}>{clienteNombre}</p>
          {clienteEmail && <p style={{ margin: "4px 0", fontSize: "0.875rem", color: "#6B7280" }}>Email: {clienteEmail}</p>}
          {clienteTelefono && <p style={{ margin: "4px 0", fontSize: "0.875rem", color: "#6B7280" }}>Tel: {clienteTelefono}</p>}
        </div>

        <div>
          <h3 style={{ margin: "0 0 12px", fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Equipo</h3>
          <p style={{ margin: "6px 0", fontSize: "0.95rem" }}>{equipoMarca} {equipoModelo}</p>
          <p style={{ margin: "4px 0", fontSize: "0.875rem", color: "#6B7280" }}>Tipo: {equipoTipo}</p>
          {equipoSerie && <p style={{ margin: "4px 0", fontSize: "0.875rem", color: "#6B7280" }}>Serie: {equipoSerie}</p>}
        </div>
      </section>

      <section style={{ marginBottom: "32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Local</p>
          <p style={{ margin: "6px 0 0", fontSize: "0.95rem" }}>{localNombre}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Técnico</p>
          <p style={{ margin: "6px 0 0", fontSize: "0.95rem" }}>{tecnicoNombre ?? "Por asignar"}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Ingreso</p>
          <p style={{ margin: "6px 0 0", fontSize: "0.95rem" }}>{new Date(fechaIngreso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Compromiso</p>
          <p style={{ margin: "6px 0 0", fontSize: "0.95rem" }}>{fechaCompromiso ? new Date(fechaCompromiso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }) : "Sin asignar"}</p>
        </div>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Descripción de la falla</h3>
        <p style={{ margin: "0", fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>{falla}</p>
      </section>

      {condicionIngreso && (
        <section style={{ marginBottom: "32px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Condición del ingreso</h3>
          <p style={{ margin: "0", fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>{condicionIngreso}</p>
        </section>
      )}

      {diagnostico && (
        <section style={{ marginBottom: "32px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Diagnóstico</h3>
          <p style={{ margin: "0", fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>{diagnostico}</p>
        </section>
      )}

      {solucion && (
        <section style={{ marginBottom: "32px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Solución realizada</h3>
          <p style={{ margin: "0", fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>{solucion}</p>
        </section>
      )}

      {fechaEntrega && (
        <section style={{ marginBottom: "32px" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6B7280" }}>Fecha de entrega</p>
          <p style={{ margin: "6px 0 0", fontSize: "0.95rem" }}>{new Date(fechaEntrega).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}</p>
        </section>
      )}

      <footer style={{ borderTop: "1px solid #E5E7EB", paddingTop: "16px", fontSize: "0.85rem", color: "#6B7280" }}>
        <p style={{ margin: 0 }}>Documento preparado para impresión</p>
      </footer>
    </article>
  )
}
