"use client"

import { useActionState, useEffect, useEffectEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import { saveProviderAction, type ProviderActionState } from "./actions"

type ProviderItem = {
  id: string
  nombre: string
  email: string
  telefono?: string | null
  contactoNombre?: string | null
  direccion?: string | null
  notas?: string | null
  activo: boolean
  creadoEn: string
  repuestosCount: number
  ordenesCompraCount: number
}

type ProviderFormProps = {
  providers: ProviderItem[]
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="btn btn-primary" disabled={pending} style={{ width: "100%" }}>
      {pending ? (editing ? "Guardando..." : "Creando proveedor...") : editing ? "Guardar cambios" : "Crear proveedor"}
    </button>
  )
}

const initialState: ProviderActionState = {}

export default function ProviderForm({ providers }: ProviderFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(saveProviderAction, initialState)
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null)
  const handleSuccess = useEffectEvent(() => {
    router.refresh()
    setSelectedProvider(null)
  })

  useEffect(() => {
    if (state.success) {
      handleSuccess()
    }
  }, [state.success])

  const isEditing = Boolean(selectedProvider)
  const formKey = selectedProvider?.id ?? "new"

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
              {isEditing ? "Editar proveedor" : "Crear nuevo proveedor"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              {isEditing
                ? "Actualiza los datos del proveedor o limpia el formulario para registrar otro."
                : "Registra proveedores para usarlos en stock y en la emisión de órdenes de compra."}
            </p>
          </div>
        </div>

        <form key={formKey} action={formAction} style={{ padding: "var(--spacing-xl)", display: "grid", gap: "var(--spacing-lg)" }}>
          {isEditing && <input type="hidden" name="providerId" value={selectedProvider?.id ?? ""} />}

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
                placeholder="Repuestos del Pacífico"
                defaultValue={selectedProvider?.nombre ?? ""}
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
                placeholder="ventas@proveedor.cl"
                defaultValue={selectedProvider?.email ?? ""}
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="contactoNombre">
                Contacto
              </label>
              <input
                id="contactoNombre"
                name="contactoNombre"
                type="text"
                className="input"
                placeholder="Andrea Rojas"
                defaultValue={selectedProvider?.contactoNombre ?? ""}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="telefono">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="text"
                className="input"
                placeholder="+56 9 1234 5678"
                defaultValue={selectedProvider?.telefono ?? ""}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label" htmlFor="direccion">
                Dirección
              </label>
              <input
                id="direccion"
                name="direccion"
                type="text"
                className="input"
                placeholder="Av. Industrial 450, Santiago"
                defaultValue={selectedProvider?.direccion ?? ""}
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
              placeholder="Condiciones comerciales, horarios de atención, observaciones..."
              style={{ minHeight: 88 }}
              defaultValue={selectedProvider?.notas ?? ""}
            />
          </div>

          <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-sm)", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
            <input
              type="checkbox"
              name="activo"
              defaultChecked={selectedProvider?.activo ?? true}
            />
            Mantener proveedor activo para stock y órdenes de compra
          </label>

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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--spacing-sm)" }}>
            <div>
              <SubmitButton editing={isEditing} />
            </div>
            <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setSelectedProvider(null)}>
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
              Proveedores registrados
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Haz clic en un proveedor para editarlo y revisar su uso en repuestos y OCs.
            </p>
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {providers.length} registro(s)
          </span>
        </div>

        {providers.length > 0 ? (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Contacto</th>
                  <th>Email</th>
                  <th>Repuestos</th>
                  <th>OCs</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    style={{ cursor: "pointer", backgroundColor: selectedProvider?.id === provider.id ? "rgba(59, 130, 246, 0.08)" : undefined }}
                  >
                    <td style={{ fontWeight: 500 }}>{provider.nombre}</td>
                    <td>{provider.contactoNombre ?? provider.telefono ?? "-"}</td>
                    <td style={{ color: "var(--color-text-tertiary)" }}>{provider.email}</td>
                    <td>{provider.repuestosCount}</td>
                    <td>{provider.ordenesCompraCount}</td>
                    <td>
                      <span className={`badge ${provider.activo ? "badge-success" : "badge-neutral"}`}>
                        {provider.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No hay proveedores registrados</div>
            <div className="empty-state-desc">
              Crea tu primer proveedor para usarlo desde stock y en la generación de OCs.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
