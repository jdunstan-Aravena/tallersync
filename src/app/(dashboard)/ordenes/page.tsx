import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getPurchaseOrdersPageData } from "../dashboard-data"
import CreatePurchaseOrderForm from "../ordenes-compra/CreatePurchaseOrderFormWrapper"
import CreateWorkOrderForm from "./CreateWorkOrderForm"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value)
}

function formatOrderNumber(number: number) {
  return `OC-${String(number).padStart(4, "0")}`
}

function getOrderStatusLabel(status: string) {
  switch (status) {
    case "BORRADOR":
      return "Borrador"
    case "ENVIADA":
      return "Enviada"
    case "RECIBIDA":
      return "Recibida"
    case "CANCELADA":
      return "Cancelada"
    default:
      return status
  }
}

function getOrderStatusBadge(status: string) {
  switch (status) {
    case "BORRADOR":
      return "badge badge-neutral"
    case "ENVIADA":
      return "badge badge-info"
    case "RECIBIDA":
      return "badge badge-success"
    case "CANCELADA":
      return "badge badge-danger"
    default:
      return "badge badge-neutral"
  }
}

type OrdenesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getSearchParamValue(value: string | string[] | undefined) {
  if (typeof value === "string" && value.length > 0) {
    return value
  }

  if (Array.isArray(value) && value[0]) {
    return value[0]
  }

  return null
}

export default async function OrdenesPage({ searchParams }: OrdenesPageProps) {
  const resolvedSearchParams = await searchParams
  const requestedOrderId = getSearchParamValue(resolvedSearchParams.orderId)
  const {
    context,
    purchaseSuggestions,
    purchaseSuggestionGroups,
    purchaseOrders,
    recentOrders,
    stats,
  } = await getPurchaseOrdersPageData()
  const localIds = context.locales.map((local) => local.id)

  let orders = recentOrders

  if (requestedOrderId && !recentOrders.some((order) => order.id === requestedOrderId)) {
    const requestedOrder = await prisma.ordenTrabajo.findFirst({
      where: {
        id: requestedOrderId,
        localId: { in: localIds },
      },
      select: {
        id: true,
        numero: true,
        estado: true,
        falla: true,
        condicionIngreso: true,
        fechaIngreso: true,
        fechaCompromiso: true,
        clienteId: true,
        equipoId: true,
        localId: true,
        tecnicoId: true,
        cliente: {
          select: { nombre: true, email: true, telefono: true },
        },
        equipo: {
          select: { tipo: true, marca: true, modelo: true, numeroSerie: true },
        },
        tecnico: {
          select: { id: true, nombre: true },
        },
        local: {
          select: { nombre: true },
        },
      },
    })

    if (requestedOrder) {
      orders = [
        {
          ...requestedOrder,
          fechaIngreso: requestedOrder.fechaIngreso.toISOString(),
          fechaCompromiso: requestedOrder.fechaCompromiso?.toISOString() ?? null,
        },
        ...recentOrders.filter((order) => order.id !== requestedOrder.id),
      ]
    }
  }

  const tecnicos = await prisma.usuario.findMany({
    where: {
      organizacionId: context.organization.id,
      rol: "TECNICO",
      activo: true,
    },
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  })

  const estimatedInvestment = purchaseSuggestions.reduce((sum, item) => sum + item.estimatedCost, 0)

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
            Órdenes
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", margin: 0 }}>
            Aquí reunimos tus órdenes de trabajo y la creación de órdenes de compra para {context.organization.nombre}.
          </p>
        </div>
        <Link href="/agenda" className="btn btn-secondary">
          Ir a agenda
        </Link>
      </div>

      <CreateWorkOrderForm
        local={context.localPrincipal || context.locales[0]}
        locales={context.locales}
        orders={orders}
        tecnicos={tecnicos}
        initialOrderId={requestedOrderId}
      />

      <div className="orders-layout" style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 0.9fr)",
        gap: "var(--spacing-lg)",
        marginBottom: "var(--spacing-2xl)",
      }}>
        <div className="card">
          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: 500, margin: 0 }}>
              Crear órdenes de compra
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Cada formulario genera una OC nueva con los repuestos que hoy están bajo stock mínimo por local.
            </p>
          </div>

          {purchaseSuggestionGroups.length > 0 ? (
            <div style={{ display: "grid", gap: "var(--spacing-lg)" }}>
              {purchaseSuggestionGroups.map((group) => (
                <CreatePurchaseOrderForm key={group.localId} group={group} />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "var(--spacing-2xl)" }}>
              <div className="empty-state-title">No hay compras pendientes por crear</div>
              <div className="empty-state-desc">
                Todos tus repuestos activos están por sobre el stock mínimo. Cuando aparezcan alertas, aquí podrás generar la OC de inmediato.
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: "var(--spacing-lg)" }}>
          <div className="card">
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: 500, marginTop: 0, marginBottom: "var(--spacing-xs)" }}>
              Resumen de compra
            </h2>
            <p style={{ marginTop: 0, marginBottom: "var(--spacing-lg)", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Tus compras se consolidan solo con los locales asociados a tu cuenta.
            </p>
            <div style={{ display: "grid", gap: "var(--spacing-md)" }}>
              <div className="card-muted">
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Productos sugeridos</span>
                <strong style={{ display: "block", marginTop: 4, fontSize: "var(--text-lg)" }}>{purchaseSuggestions.length}</strong>
              </div>
              <div className="card-muted">
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Inversión estimada</span>
                <strong style={{ display: "block", marginTop: 4, fontSize: "var(--text-lg)" }}>{formatCurrency(estimatedInvestment)}</strong>
              </div>
              <div className="card-muted">
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Items críticos</span>
                <strong style={{ display: "block", marginTop: 4, fontSize: "var(--text-lg)" }}>{stats.criticalPurchaseCount}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: 500, marginTop: 0, marginBottom: "var(--spacing-xs)" }}>
              Locales incluidos
            </h2>
            <div style={{ display: "grid", gap: "var(--spacing-sm)" }}>
              {context.locales.map((local) => (
                <div key={local.id} className="card-sm" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-sm)" }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}>{local.nombre}</span>
                  {local.esPrincipal && <span className="badge badge-success">Principal</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
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
              Órdenes de compra creadas
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Historial reciente de OCs registradas desde el panel.
            </p>
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {purchaseOrders.length} registro(s)
          </span>
        </div>

        {purchaseOrders.length > 0 ? (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>OC</th>
                  <th>Local</th>
                  <th>Estado</th>
                  <th>Proveedor</th>
                  <th>Técnico</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Creada por</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)" }}>
                      {formatOrderNumber(order.numero)}
                    </td>
                    <td>{order.localNombre}</td>
                    <td>
                      <span className={getOrderStatusBadge(order.estado)}>
                        {getOrderStatusLabel(order.estado)}
                      </span>
                    </td>
                    <td>{order.proveedor ?? "Sin proveedor"}</td>
                    <td>{order.tecnicoAsignadoNombre ?? "Sin asignar"}</td>
                    <td>{order.itemCount}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>{order.creadoPorNombre}</td>
                    <td style={{ color: "var(--color-text-tertiary)" }}>
                      {formatDateTime(order.creadoEn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">Todavía no hay órdenes de compra creadas</div>
            <div className="empty-state-desc">
              Usa los formularios de arriba para crear la primera OC y dejarla registrada en el historial.
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .orders-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
