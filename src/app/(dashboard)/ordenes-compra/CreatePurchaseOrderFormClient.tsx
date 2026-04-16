"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import type { PurchaseSuggestionGroup } from "../dashboard-data"
import { createPurchaseOrderAction, type CreatePurchaseOrderState } from "./actions"

type Tecnico = {
  id: string
  nombre: string
}

type CreatePurchaseOrderFormProps = {
  group: PurchaseSuggestionGroup
  tecnicos: Tecnico[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value)
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={pending}
      style={{ width: "100%" }}
    >
      {pending ? "Creando OC..." : "Crear orden de compra"}
    </button>
  )
}

const initialState: CreatePurchaseOrderState = {}

export default function CreatePurchaseOrderForm({ group, tecnicos }: CreatePurchaseOrderFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(createPurchaseOrderAction, initialState)

  useEffect(() => {
    if (state.success) {
      router.refresh()
    }
  }, [router, state.success])

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--spacing-md)", marginBottom: "var(--spacing-lg)" }}>
        <div>
          <h3 style={{ fontSize: "var(--text-md)", margin: 0 }}>{group.localNombre}</h3>
          <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
            {group.itemCount} item(s) sugeridos para reposición.
          </p>
        </div>
        <span className={`badge ${group.criticalCount > 0 ? "badge-danger" : "badge-info"}`}>
          {group.criticalCount > 0 ? `${group.criticalCount} críticos` : "Sin críticos"}
        </span>
      </div>

      <div style={{ display: "grid", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-lg)" }}>
        {group.items.map((item) => (
          <div key={item.id} className="card-muted" style={{ padding: "var(--spacing-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--spacing-sm)", alignItems: "center", marginBottom: 4 }}>
              <strong style={{ fontSize: "var(--text-sm)" }}>{item.nombre}</strong>
              <span className={`badge ${item.urgency === "critica" ? "badge-danger" : "badge-warning"}`}>
                {item.urgency === "critica" ? "Crítica" : "Media"}
              </span>
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
              Stock {item.stockActual} / mínimo {item.stockMinimo} · sugerido {item.quantityToOrder} un. · {formatCurrency(item.estimatedCost)}
            </div>
          </div>
        ))}
      </div>

      <form action={formAction} style={{ display: "grid", gap: "var(--spacing-md)" }}>
        <input type="hidden" name="localId" value={group.localId} />

        <div>
          <label className="form-label" htmlFor={`proveedor-${group.localId}`}>
            Proveedor
          </label>
          <input
            id={`proveedor-${group.localId}`}
            name="proveedor"
            type="text"
            className={`input ${state.error ? "input-error" : ""}`}
            placeholder="Opcional"
          />
        </div>

        <div>
          <label className="form-label" htmlFor={`nota-${group.localId}`}>
            Nota interna
          </label>
          <textarea
            id={`nota-${group.localId}`}
            name="nota"
            className={`textarea ${state.error ? "input-error" : ""}`}
            placeholder="Ej. Priorizar entrega esta semana"
            style={{ minHeight: 88 }}
          />
        </div>

        <div>
          <label className="form-label" htmlFor={`tecnico-${group.localId}`}>
            Técnico asignado
          </label>
          <select
            id={`tecnico-${group.localId}`}
            name="tecnicoAsignadoId"
            className="input"
          >
            <option value="">Sin asignar</option>
            {tecnicos.map((tecnico) => (
              <option key={tecnico.id} value={tecnico.id}>
                {tecnico.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="card-muted" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-sm)" }}>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Total estimado</span>
          <strong style={{ fontSize: "var(--text-md)" }}>{formatCurrency(group.totalEstimatedCost)}</strong>
        </div>

        {state.error && <p className="form-error" style={{ margin: 0 }}>{state.error}</p>}
        {state.success && <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-brand-text)" }}>{state.success}</p>}

        <SubmitButton />
      </form>
    </div>
  )
}
