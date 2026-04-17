"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import type { TipoEquipo } from "@prisma/client"
import type { DashboardLocal } from "../dashboard-data"
import WorkOrderTemplate from "./WorkOrderTemplate"
import {
  saveWorkOrderAction,
  deleteWorkOrderAction,
  type CreateWorkOrderState,
} from "./actions"

type WorkOrderItem = {
  id: string
  numero: number
  estado: string
  localId: string
  local: { nombre: string }
  cliente: { nombre: string; email?: string | null; telefono?: string | null }
  equipo: { tipo: TipoEquipo; marca: string; modelo: string; numeroSerie?: string | null }
  tecnico?: { id: string; nombre: string } | null
  falla: string
  diagnostico?: string | null
  solucion?: string | null
  condicionIngreso?: string | null
  fechaCompromiso?: string | Date | null
  fechaIngreso: string | Date
  fechaEntrega?: string | null
}

type Tecnico = {
  id: string
  nombre: string
}

type CreateWorkOrderFormProps = {
  local: DashboardLocal
  locales: DashboardLocal[]
  orders: WorkOrderItem[]
  tecnicos: Tecnico[]
}

function formatDateForInput(value?: string | Date | null) {
  if (!value) {
    return ""
  }

  const date = value instanceof Date ? value : new Date(value)
  return date.toISOString().slice(0, 10)
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={pending}
      style={{ width: "100%" }}
    >
      {pending ? (editing ? "Guardando cambios..." : "Creando orden...") : editing ? "Guardar cambios" : "Crear orden de trabajo"}
    </button>
  )
}

const initialState: CreateWorkOrderState = {}

const equipoTipos = [
  { value: "ELECTRODOMESTICO" as TipoEquipo, label: "Electrodoméstico" },
  { value: "CELULAR" as TipoEquipo, label: "Celular" },
  { value: "TABLET" as TipoEquipo, label: "Tablet" },
  { value: "NOTEBOOK" as TipoEquipo, label: "Notebook" },
  { value: "PC_ESCRITORIO" as TipoEquipo, label: "PC de escritorio" },
  { value: "CONSOLA" as TipoEquipo, label: "Consola" },
  { value: "OTRO" as TipoEquipo, label: "Otro" },
]

export default function CreateWorkOrderForm({ local, locales, orders, tecnicos }: CreateWorkOrderFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(saveWorkOrderAction, initialState)
  const [deleteState, deleteAction] = useActionState(deleteWorkOrderAction, initialState)
  const [selectedOrder, setSelectedOrder] = useState<WorkOrderItem | null>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.success || deleteState.success) {
      router.refresh()
      setSelectedOrder(null)
    }
  }, [router, state.success, deleteState.success])

  const isEditing = Boolean(selectedOrder)
  const formKey = selectedOrder?.id ?? "new"

  function handleClear() {
    setSelectedOrder(null)
  }

  function handlePrint() {
    if (!selectedOrder) return

    setShowPrintModal(true)

    setTimeout(() => {
      if (printRef.current) {
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write("<!DOCTYPE html>")
          printWindow.document.write("<html><head>")
          printWindow.document.write('<meta charset="UTF-8">')
          printWindow.document.write("<style>")
          printWindow.document.write("body { margin: 0; padding: 20px; font-family: Inter, sans-serif; }")
          printWindow.document.write("@media print { body { padding: 0; } }")
          printWindow.document.write("</style>")
          printWindow.document.write("</head><body>")
          printWindow.document.write(printRef.current.innerHTML)
          printWindow.document.write("</body></html>")
          printWindow.document.close()
          printWindow.print()
        }
      }
    }, 100)
  }

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
              {isEditing ? "Editar orden de trabajo" : "Crear nueva orden de trabajo"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              {isEditing
                ? "Actualiza los datos o presiona Limpiar para empezar una nueva orden."
                : "Registra un nuevo equipo para reparar y agenda el seguimiento."}
            </p>
          </div>
        </div>

        <form key={formKey} action={formAction} style={{ padding: "var(--spacing-xl)", display: "grid", gap: "var(--spacing-lg)" }}>
          {isEditing && <input type="hidden" name="orderId" value={selectedOrder?.id ?? ""} />}

          {/* Local y Fecha Compromiso */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
            <div>
              <label className="form-label" htmlFor="localId">
                Local
              </label>
              <select
                id="localId"
                name="localId"
                className={`input ${state.error ? "input-error" : ""}`}
                defaultValue={selectedOrder?.localId ?? local.id}
              >
                {locales.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="fechaCompromiso">
                Fecha compromiso
              </label>
              <input
                id="fechaCompromiso"
                name="fechaCompromiso"
                type="date"
                className="input"
                defaultValue={formatDateForInput(selectedOrder?.fechaCompromiso)}
              />
            </div>
          </div>

          {/* Cliente */}
          <div style={{ borderTop: "0.5px solid var(--color-border)", paddingTop: "var(--spacing-lg)" }}>
            <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 500, margin: "0 0 var(--spacing-md)" }}>Datos del cliente</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--spacing-md)" }}>
              <div>
                <label className="form-label" htmlFor="clienteNombre">
                  Nombre *
                </label>
                <input
                  id="clienteNombre"
                  name="clienteNombre"
                  type="text"
                  className={`input ${state.error?.includes("nombre del cliente") ? "input-error" : ""}`}
                  placeholder="Juan Pérez"
                  defaultValue={selectedOrder?.cliente.nombre ?? ""}
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="clienteEmail">
                  Email
                </label>
                <input
                  id="clienteEmail"
                  name="clienteEmail"
                  type="email"
                  className="input"
                  placeholder="juan@example.com"
                  defaultValue={selectedOrder?.cliente.email ?? ""}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="clienteTelefono">
                  Teléfono
                </label>
                <input
                  id="clienteTelefono"
                  name="clienteTelefono"
                  type="tel"
                  className="input"
                  placeholder="+56 9 1234 5678"
                  defaultValue={selectedOrder?.cliente.telefono ?? ""}
                />
              </div>
            </div>
          </div>

          {/* Equipo */}
          <div style={{ borderTop: "0.5px solid var(--color-border)", paddingTop: "var(--spacing-lg)" }}>
            <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 500, margin: "0 0 var(--spacing-md)" }}>Datos del equipo</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--spacing-md)" }}>
              <div>
                <label className="form-label" htmlFor="equipoTipo">
                  Tipo *
                </label>
                <select
                  id="equipoTipo"
                  name="equipoTipo"
                  className={`input ${state.error?.includes("tipo de equipo") ? "input-error" : ""}`}
                  defaultValue={selectedOrder?.equipo.tipo ?? ""}
                  required
                >
                  <option value="">Selecciona un tipo</option>
                  {equipoTipos.map((tipo) => (
                    <option key={`${tipo.value}-${tipo.label}`} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="equipoMarca">
                  Marca *
                </label>
                <input
                  id="equipoMarca"
                  name="equipoMarca"
                  type="text"
                  className={`input ${state.error?.includes("marca") ? "input-error" : ""}`}
                  placeholder="Bosch"
                  defaultValue={selectedOrder?.equipo.marca ?? ""}
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="equipoModelo">
                  Modelo *
                </label>
                <input
                  id="equipoModelo"
                  name="equipoModelo"
                  type="text"
                  className={`input ${state.error?.includes("modelo") ? "input-error" : ""}`}
                  placeholder="Refrigerador No Frost"
                  defaultValue={selectedOrder?.equipo.modelo ?? ""}
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="equipoSerie">
                  Número de serie
                </label>
                <input
                  id="equipoSerie"
                  name="equipoSerie"
                  type="text"
                  className="input"
                  placeholder="SN-BOS-4587"
                  defaultValue={selectedOrder?.equipo.numeroSerie ?? ""}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="tecnicoId">
                  Técnico asignado
                </label>
                <select
                  id="tecnicoId"
                  name="tecnicoId"
                  className="input"
                  defaultValue={selectedOrder?.tecnico?.id ?? ""}
                >
                  <option value="">Sin asignar</option>
                  {tecnicos.map((tecnico) => (
                    <option key={tecnico.id} value={tecnico.id}>
                      {tecnico.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Orden */}
          <div style={{ borderTop: "0.5px solid var(--color-border)", paddingTop: "var(--spacing-lg)" }}>
            <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 500, margin: "0 0 var(--spacing-md)" }}>Datos de la reparación</h3>
            <div style={{ display: "grid", gap: "var(--spacing-md)" }}>
              <div>
                <label className="form-label" htmlFor="falla">
                  Descripción de la falla *
                </label>
                <textarea
                  id="falla"
                  name="falla"
                  className={`textarea ${state.error?.includes("falla") ? "input-error" : ""}`}
                  placeholder="Ej. No enciende, hace ruido al arrancar"
                  style={{ minHeight: 88 }}
                  defaultValue={selectedOrder?.falla ?? ""}
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="condicionIngreso">
                  Condición del ingreso
                </label>
                <textarea
                  id="condicionIngreso"
                  name="condicionIngreso"
                  className="textarea"
                  placeholder="Ej. Sin gas, filtro sucio, puerta abollada"
                  style={{ minHeight: 64 }}
                  defaultValue={selectedOrder?.condicionIngreso ?? ""}
                />
              </div>
            </div>
          </div>

          {/* Mensajes de error/éxito */}
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
            <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={handlePrint}>
              Imprimir Orden
            </button>
            <button type="button" className="btn btn-ghost" style={{ width: "100%" }} onClick={handleClear}>
              Limpiar formulario
            </button>
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
              Órdenes de trabajo recientes
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Haz clic en una orden para cargarla en el formulario y actualizarla.
            </p>
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {orders.length} registro(s)
          </span>
        </div>

        {orders.length > 0 ? (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Equipo</th>
                  <th>Cliente</th>
                  <th>Técnico</th>
                  <th>Estado</th>
                  <th>Local</th>
                  <th>Ingreso</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    style={{ cursor: "pointer", backgroundColor: selectedOrder?.id === order.id ? "rgba(59, 130, 246, 0.08)" : undefined }}
                  >
                    <td style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
                      #{String(order.numero).padStart(4, "0")}
                    </td>
                    <td>{`${order.equipo.marca} ${order.equipo.modelo}`}</td>
                    <td>{order.cliente.nombre}</td>
                    <td>{order.tecnico?.nombre ?? "Sin asignar"}</td>
                    <td>
                      <span className="badge badge-neutral">{order.estado}</span>
                    </td>
                    <td>{order.local.nombre}</td>
                    <td style={{ color: "var(--color-text-tertiary)" }}>
                      {formatDateForInput(order.fechaIngreso)}
                    </td>
                    <td>
                      <form action={deleteAction} style={{ display: "inline" }}>
                        <input type="hidden" name="orderId" value={order.id} />
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
            <div className="empty-state-title">Todavía no hay órdenes de trabajo</div>
            <div className="empty-state-desc">
              Cuando ingresen nuevas OTs aquí podrás seleccionarlas para editarlas.
            </div>
          </div>
        )}
      </div>

      {showPrintModal && selectedOrder && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "8px", maxHeight: "90vh", overflow: "auto", width: "90%", maxWidth: "800px" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>Vista previa de impresión</h2>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#6B7280" }}
              >
                ✕
              </button>
            </div>

            <div ref={printRef} style={{ padding: "24px" }}>
              <WorkOrderTemplate
                numero={selectedOrder.numero}
                estado={selectedOrder.estado as any}
                falla={selectedOrder.falla}
                diagnostico={selectedOrder.diagnostico}
                solucion={selectedOrder.solucion}
                condicionIngreso={selectedOrder.condicionIngreso}
                fechaIngreso={String(selectedOrder.fechaIngreso)}
                fechaCompromiso={selectedOrder.fechaCompromiso ? String(selectedOrder.fechaCompromiso) : undefined}
                fechaEntrega={selectedOrder.fechaEntrega}
                localNombre={selectedOrder.local.nombre}
                clienteNombre={selectedOrder.cliente.nombre}
                clienteEmail={selectedOrder.cliente.email}
                clienteTelefono={selectedOrder.cliente.telefono}
                equipoTipo={selectedOrder.equipo.tipo}
                equipoMarca={selectedOrder.equipo.marca}
                equipoModelo={selectedOrder.equipo.modelo}
                equipoSerie={selectedOrder.equipo.numeroSerie}
                tecnicoNombre={selectedOrder.tecnico?.nombre}
              />
            </div>

            <div style={{ padding: "16px", borderTop: "1px solid #E5E7EB", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPrintModal(false)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (printRef.current) {
                    const printWindow = window.open("", "_blank")
                    if (printWindow) {
                      printWindow.document.write("<!DOCTYPE html>")
                      printWindow.document.write("<html><head>")
                      printWindow.document.write('<meta charset="UTF-8">')
                      printWindow.document.write("<style>")
                      printWindow.document.write("body { margin: 0; padding: 20px; font-family: Inter, sans-serif; }")
                      printWindow.document.write("@media print { body { padding: 0; } }")
                      printWindow.document.write("</style>")
                      printWindow.document.write("</head><body>")
                      printWindow.document.write(printRef.current.innerHTML)
                      printWindow.document.write("</body></html>")
                      printWindow.document.close()
                      printWindow.print()
                    }
                  }
                }}
              >
                Imprimir ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
