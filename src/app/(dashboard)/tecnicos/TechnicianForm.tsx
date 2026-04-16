"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import { saveTechnicianAction, deleteTechnicianAction, type TechnicianActionState } from "./actions"

type TechnicianItem = {
  id: string
  nombre: string
  email: string
  creadoEn: string
}

type TechnicianFormProps = {
  technicians: TechnicianItem[]
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="btn btn-primary" disabled={pending} style={{ width: "100%" }}>
      {pending ? (editing ? "Guardando..." : "Creando técnico...") : editing ? "Guardar cambios" : "Crear técnico"}
    </button>
  )
}

const initialState: TechnicianActionState = {}

export default function TechnicianForm({ technicians }: TechnicianFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(saveTechnicianAction, initialState)
  const [deleteState, deleteAction] = useActionState(deleteTechnicianAction, initialState)
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianItem | null>(null)

  useEffect(() => {
    if (state.success || deleteState.success) {
      router.refresh()
      setSelectedTechnician(null)
    }
  }, [router, state.success, deleteState.success])

  const isEditing = Boolean(selectedTechnician)
  const formKey = selectedTechnician?.id ?? "new"

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
              {isEditing ? "Editar técnico" : "Crear nuevo técnico"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              {isEditing ? "Actualiza los datos o presiona Limpiar para empezar." : "Registra un nuevo técnico en el sistema."}
            </p>
          </div>
        </div>

        <form key={formKey} action={formAction} style={{ padding: "var(--spacing-xl)", display: "grid", gap: "var(--spacing-lg)" }}>
          {isEditing && <input type="hidden" name="technicianId" value={selectedTechnician?.id ?? ""} />}

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
                placeholder="Carlos Méndez"
                defaultValue={selectedTechnician?.nombre ?? ""}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="email">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`input ${state.error?.includes("email") ? "input-error" : ""}`}
                placeholder="carlos@example.com"
                defaultValue={selectedTechnician?.email ?? ""}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="password">
                {isEditing ? "Nueva contraseña (opcional)" : "Contraseña *"}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`input ${state.error?.includes("Contraseña") ? "input-error" : ""}`}
                placeholder={isEditing ? "Dejar en blanco para no cambiar" : "Mínimo 8 caracteres"}
                required={!isEditing}
              />
            </div>
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
            <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setSelectedTechnician(null)}>
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
              Técnicos del sistema
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Haz clic en un técnico para editar sus datos.
            </p>
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {technicians.length} registro(s)
          </span>
        </div>

        {technicians.length > 0 ? (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Creado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((technician) => (
                  <tr
                    key={technician.id}
                    onClick={() => setSelectedTechnician(technician)}
                    style={{ cursor: "pointer", backgroundColor: selectedTechnician?.id === technician.id ? "rgba(59, 130, 246, 0.08)" : undefined }}
                  >
                    <td style={{ fontWeight: 500 }}>{technician.nombre}</td>
                    <td style={{ color: "var(--color-text-tertiary)" }}>{technician.email}</td>
                    <td style={{ color: "var(--color-text-tertiary)", fontSize: "0.875rem" }}>
                      {new Date(technician.creadoEn).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <form action={deleteAction} style={{ display: "inline" }}>
                        <input type="hidden" name="technicianId" value={technician.id} />
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
            <div className="empty-state-title">No hay técnicos registrados</div>
            <div className="empty-state-desc">
              Crea tu primer técnico usando el formulario anterior.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
