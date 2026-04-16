import Link from "next/link"
import { EstadoOT } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"

type ScheduledAgendaOrder = {
  id: string
  numero: number
  estado: EstadoOT
  fechaCompromiso: Date | null
  cliente: { nombre: string }
  equipo: { marca: string; modelo: string }
  tecnico: { nombre: string } | null
  local: { nombre: string }
}

type UnscheduledAgendaOrder = {
  id: string
  numero: number
  estado: EstadoOT
  cliente: { nombre: string }
  equipo: { marca: string; modelo: string }
  local: { nombre: string }
}

function startOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function endOfDay(date: Date) {
  const value = new Date(date)
  value.setHours(23, 59, 59, 999)
  return value
}

function addDays(date: Date, days: number) {
  const value = new Date(date)
  value.setDate(value.getDate() + days)
  return value
}

function formatDateTime(date: Date | null) {
  if (!date) {
    return "Sin fecha"
  }

  return new Intl.DateTimeFormat("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function getOtStatusBadge(status: string) {
  switch (status) {
    case "RECIBIDO":
      return "badge badge-recibido"
    case "EN_DIAGNOSTICO":
      return "badge badge-diagnostico"
    case "ESPERANDO_REPUESTO":
      return "badge badge-repuesto"
    case "EN_REPARACION":
      return "badge badge-reparacion"
    case "CONTROL_CALIDAD":
      return "badge badge-calidad"
    case "LISTO_RETIRO":
      return "badge badge-listo"
    case "ENTREGADO":
      return "badge badge-entregado"
    case "CANCELADO":
      return "badge badge-danger"
    default:
      return "badge badge-neutral"
  }
}

function getOtStatusLabel(status: string) {
  switch (status) {
    case "RECIBIDO":
      return "Recibido"
    case "EN_DIAGNOSTICO":
      return "En diagnóstico"
    case "ESPERANDO_REPUESTO":
      return "Esperando repuesto"
    case "EN_REPARACION":
      return "En reparación"
    case "CONTROL_CALIDAD":
      return "Control calidad"
    case "LISTO_RETIRO":
      return "Listo para retiro"
    case "ENTREGADO":
      return "Entregado"
    case "CANCELADO":
      return "Cancelado"
    default:
      return status
  }
}

export default async function AgendaPage() {
  const context = await getDashboardContext()
  const localIds = context.locales.map((local) => local.id)
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)
  const weekEnd = endOfDay(addDays(today, 7))
  const closedStates = [EstadoOT.ENTREGADO, EstadoOT.CANCELADO]

  let todayCount = 0
  let weekCount = 0
  let overdueCount = 0
  let unassignedCount = 0
  let scheduledOrders: ScheduledAgendaOrder[] = []
  let unscheduledOrders: UnscheduledAgendaOrder[] = []

  if (localIds.length > 0) {
    ;[
      todayCount,
      weekCount,
      overdueCount,
      unassignedCount,
      scheduledOrders,
      unscheduledOrders,
    ] = await Promise.all([
        prisma.ordenTrabajo.count({
          where: {
            localId: { in: localIds },
            estado: { notIn: closedStates },
            fechaCompromiso: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        }),
        prisma.ordenTrabajo.count({
          where: {
            localId: { in: localIds },
            estado: { notIn: closedStates },
            fechaCompromiso: {
              gte: todayStart,
              lte: weekEnd,
            },
          },
        }),
        prisma.ordenTrabajo.count({
          where: {
            localId: { in: localIds },
            estado: { notIn: closedStates },
            fechaCompromiso: {
              lt: todayStart,
            },
          },
        }),
        prisma.ordenTrabajo.count({
          where: {
            localId: { in: localIds },
            estado: { notIn: closedStates },
            tecnicoId: null,
          },
        }),
        prisma.ordenTrabajo.findMany({
          where: {
            localId: { in: localIds },
            estado: { notIn: closedStates },
            fechaCompromiso: {
              not: null,
            },
          },
          include: {
            cliente: { select: { nombre: true } },
            equipo: { select: { marca: true, modelo: true } },
            tecnico: { select: { nombre: true } },
            local: { select: { nombre: true } },
          },
          orderBy: [{ fechaCompromiso: "asc" }, { fechaIngreso: "asc" }],
          take: 12,
        }),
        prisma.ordenTrabajo.findMany({
          where: {
            localId: { in: localIds },
            estado: { notIn: closedStates },
            fechaCompromiso: null,
          },
          include: {
            cliente: { select: { nombre: true } },
            equipo: { select: { marca: true, modelo: true } },
            local: { select: { nombre: true } },
          },
          orderBy: [{ fechaIngreso: "desc" }],
          take: 6,
        }),
      ])
  }

  return (
    <div className="page-content">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "var(--spacing-lg)",
        flexWrap: "wrap",
        marginBottom: "var(--spacing-2xl)",
      }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 500, marginBottom: 4 }}>
            Agenda
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", margin: 0 }}>
            Vista operativa de compromisos, vencimientos y órdenes por agendar en tus locales.
          </p>
        </div>
        <Link href="/ordenes" className="btn btn-secondary">
          Ver órdenes
        </Link>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "var(--spacing-md)",
        marginBottom: "var(--spacing-2xl)",
      }}>
        <div className="stat-card">
          <div className="stat-label">Compromisos hoy</div>
          <div className="stat-value stat-value-brand">{todayCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Próximos 7 días</div>
          <div className="stat-value">{weekCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Atrasadas</div>
          <div className="stat-value stat-value-danger">{overdueCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sin agendar</div>
          <div className="stat-value stat-value-warn">{unassignedCount}</div>
        </div>
      </div>

      <div className="agenda-layout" style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 0.9fr)",
        gap: "var(--spacing-lg)",
      }}>
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
                Agenda operativa
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                Órdenes con fecha compromiso para organizar el trabajo del taller.
              </p>
            </div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
              {scheduledOrders.length} registro(s)
            </span>
          </div>

          {scheduledOrders.length > 0 ? (
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Compromiso</th>
                    <th>Equipo</th>
                    <th>Cliente</th>
                    <th>Técnico</th>
                    <th>Estado</th>
                    <th>Local</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
                        #{String(order.numero).padStart(4, "0")}
                      </td>
                      <td>{formatDateTime(order.fechaCompromiso)}</td>
                      <td>{`${order.equipo.marca} ${order.equipo.modelo}`}</td>
                      <td>{order.cliente.nombre}</td>
                      <td>{order.tecnico?.nombre ?? "Sin asignar"}</td>
                      <td>
                        <span className={getOtStatusBadge(order.estado)}>
                          {getOtStatusLabel(order.estado)}
                        </span>
                      </td>
                      <td>{order.local.nombre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-title">No hay compromisos agendados</div>
              <div className="empty-state-desc">
                Cuando tus órdenes tengan fecha compromiso aparecerán aquí para ayudarte a organizar la agenda del taller.
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: "var(--spacing-lg)" }}>
          <div className="card">
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: 500, marginTop: 0, marginBottom: "var(--spacing-xs)" }}>
              Órdenes sin fecha
            </h2>
            <p style={{ marginTop: 0, marginBottom: "var(--spacing-lg)", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Estas OTs siguen abiertas, pero todavía no tienen compromiso de agenda.
            </p>
            {unscheduledOrders.length > 0 ? (
              <div style={{ display: "grid", gap: "var(--spacing-sm)" }}>
                {unscheduledOrders.map((order) => (
                  <div key={order.id} className="card-sm">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--spacing-sm)", marginBottom: 4 }}>
                      <strong style={{ fontSize: "var(--text-sm)" }}>
                        #{String(order.numero).padStart(4, "0")} · {order.local.nombre}
                      </strong>
                      <span className={getOtStatusBadge(order.estado)}>
                        {getOtStatusLabel(order.estado)}
                      </span>
                    </div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                      {`${order.equipo.marca} ${order.equipo.modelo}`} · {order.cliente.nombre}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "var(--spacing-2xl) var(--spacing-lg)" }}>
                <div className="empty-state-title">Sin pendientes por agendar</div>
                <div className="empty-state-desc">
                  No hay órdenes abiertas sin fecha compromiso en este momento.
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: 500, marginTop: 0, marginBottom: "var(--spacing-xs)" }}>
              Siguiente paso
            </h2>
            <p style={{ marginTop: 0, fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Esta vista ya resuelve el 404 y deja una base real para el siguiente bloque de Agenda/Agendamiento.
            </p>
            <div className="divider" />
            <div className="card-muted">
              <strong style={{ display: "block", marginBottom: 4, fontSize: "var(--text-sm)" }}>Próximo avance sugerido</strong>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                Crear turnos, reasignación por técnico y edición de fecha compromiso desde esta misma pantalla.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .agenda-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
