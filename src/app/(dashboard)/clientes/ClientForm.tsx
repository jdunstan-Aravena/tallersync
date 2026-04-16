"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import { saveClientAction, deleteClientAction, type ClientActionState } from "./actions"

type ClientItem = {
  id: string
  nombre: string
  email?: string | null
  telefono?: string | null
  rut?: string | null
  notas?: string | null
  creadoEn: string
}

type ClientFormProps = {
  clients: ClientItem[]
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="btn btn-primary" disabled={pending} style={{ width: "100%" }}>
      {pending ? (editing ? "Guardando..." : "Creando cliente...") : editing ? "Guardar cambios" : "Crear cliente"}
    </button>
  )
}

const initialState: ClientActionState = {}

export default function ClientForm({ clients }: ClientFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(saveClientAction, initialState)
  const [deleteState, deleteAction] = useActionState(deleteClientAction, initialState)
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null)

  useEffect(() => {
    if (state.success || deleteState.success) {
      router.refresh()
      setSelectedClient(null)
    }
  }, [router, state.success, deleteState.success])

  const isEditing = Boolean(selectedClient)
  const formKey = selectedClient?.id ?? "new"

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
              {isEditing ? "Editar cliente" : "Crear nuevo cliente"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              {isEditing ? "Actualiza los datos o presiona Limpiar para empezar." : "Registra un nuevo cliente en el sistema."}
            </p>
          </div>
        </div>

        <form key={formKey} action={formAction} style={{ padding: "var(--spacing-xl)", display: "grid", gap: "var(--spacing-lg)" }}>
          {isEditing && <input type="hidden" name="clientId" value={selectedClient?.id ?? ""} />}

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
                placeholder="Juan Pérez"
                defaultValue={selectedClient?.nombre ?? ""}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                placeholder="juan@example.com"
                defaultValue={selectedClient?.email ?? ""}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="telefono">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                className="input"
                placeholder="+56 9 1234 5678"
                defaultValue={selectedClient?.telefono ?? ""}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="rut">
                RUT
              </label>
              <input
                id="rut"
                name="rut"
                type="text"
                className="input"
                placeholder="12.345.678-9"
                defaultValue={selectedClient?.rut ?? ""}
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="notas">
              Notas
            </label>
            <textarea
              id="notas"
              name="notas"
              className="textarea"
              placeholder="Información adicional del cliente..."
              style={{ minHeight: 88 }}
              defaultValue={selectedClient?.notas ?? ""}
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
            <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setSelectedClient(null)}>
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
              Clientes registrados
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Haz clic en un cliente para editar sus datos.
            </p>
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {clients.length} registro(s)
          </span>
        </div>

        {clients.length > 0 ? (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>RUT</th>
                  <th>Creado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    style={{ cursor: "pointer", backgroundColor: selectedClient?.id === client.id ? "rgba(59, 130, 246, 0.08)" : undefined }}
                  >
                    <td style={{ fontWeight: 500 }}>{client.nombre}</td>
                    <td style={{ color: "var(--color-text-tertiary)" }}>{client.email ?? "-"}</td>
                    <td style={{ color: "var(--color-text-tertiary)" }}>{client.telefono ?? "-"}</td>
                    <td style={{ color: "var(--color-text-tertiary)" }}>{client.rut ?? "-"}</td>
                    <td style={{ color: "var(--color-text-tertiary)", fontSize: "0.875rem" }}>
                      {new Date(client.creadoEn).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <form action={deleteAction} style={{ display: "inline" }}>
                        <input type="hidden" name="clientId" value={client.id} />
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
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No hay clientes registrados</div>
            <div className="empty-state-desc">
              Crea tu primer cliente usando el formulario anterior.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
