import Link from "next/link"
import { getDashboardOverview } from "./dashboard-data"

function formatLongDate(date: Date) {
  const formatted = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function formatShortDate(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
  }).format(value)
}

function getEstadoBadgeClass(estado: string) {
  switch (estado) {
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
    default:
      return "badge badge-neutral"
  }
}

function getEstadoLabel(estado: string) {
  switch (estado) {
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
      return estado
  }
}

export default async function DashboardPage() {
  const {
    context,
    stats,
    recentOrders,
    purchaseSuggestions,
    readyForPickupOrderId,
    readyForPickupOrderNumber,
  } = await getDashboardOverview()
  const firstName = context.user.nombre.split(" ")[0] ?? context.user.nombre
  const todayLabel = formatLongDate(new Date())
  const readyForPickupHref = readyForPickupOrderId ? `/ordenes?orderId=${readyForPickupOrderId}` : "/ordenes"
  const tableLinkStyle = {
    display: "block",
    margin: "calc(var(--spacing-md) * -1) calc(var(--spacing-lg) * -1)",
    padding: "var(--spacing-md) var(--spacing-lg)",
    color: "inherit",
    textDecoration: "none",
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
            Hola, {firstName}
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", margin: 0 }}>
            {context.organization.nombre} · {context.locales.length} {context.locales.length === 1 ? "local" : "locales"} · {todayLabel}
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
        <Link href="/configuracion" className="stat-card stat-card-link">
          <div className="stat-label">Locales activos</div>
          <div className="stat-value">{stats.assignedLocals}</div>
        </Link>
        <Link href="/tecnicos" className="stat-card stat-card-link">
          <div className="stat-label">Equipo activo</div>
          <div className="stat-value">{stats.teamSize}</div>
        </Link>
        <Link href="/ordenes" className="stat-card stat-card-link">
          <div className="stat-label">OTs abiertas</div>
          <div className="stat-value stat-value-brand">{stats.openOrders}</div>
        </Link>
        <Link href="/stock" className="stat-card stat-card-link">
          <div className="stat-label">Compras sugeridas</div>
          <div className="stat-value stat-value-warn">{stats.lowStockCount}</div>
        </Link>
      </div>

      <div className="dashboard-panels" style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 0.9fr)",
        gap: "var(--spacing-lg)",
        marginBottom: "var(--spacing-2xl)",
      }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-lg)", gap: "var(--spacing-md)", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-md)", fontWeight: 500, margin: 0 }}>
                Tus locales
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                Estos son los locales que hoy están asociados a tu cuenta.
              </p>
            </div>
            <span className="badge badge-info">
              {context.locales.length} {context.locales.length === 1 ? "local" : "locales"}
            </span>
          </div>
          {context.locales.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--spacing-md)" }}>
              {context.locales.map((local) => (
                <div key={local.id} className="card-sm">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-xs)" }}>
                    <strong style={{ fontSize: "var(--text-sm)" }}>{local.nombre}</strong>
                    {local.esPrincipal && <span className="badge badge-success">Principal</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
                    /{local.slug}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "var(--spacing-2xl)" }}>
              <div className="empty-state-title">No hay locales asignados</div>
              <div className="empty-state-desc">
                Tu cuenta no tiene locales activos asociados todavía.
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 500, marginTop: 0, marginBottom: "var(--spacing-xs)" }}>
            Accesos rápidos
          </h2>
          <p style={{ marginTop: 0, marginBottom: "var(--spacing-lg)", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
            Desde aquí puedes ir directo al abastecimiento de tus locales.
          </p>
          <div style={{ display: "grid", gap: "var(--spacing-md)" }}>
            <Link href="/ordenes" className="btn btn-primary" style={{ width: "100%" }}>
              Ir a órdenes
            </Link>
            <Link href="/stock" className="card-muted dashboard-link-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-xs)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)" }}>
                  Alertas de abastecimiento
                </span>
                <span className={`badge ${stats.criticalPurchaseCount > 0 ? "badge-danger" : "badge-info"}`}>
                  {purchaseSuggestions.length}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                {stats.criticalPurchaseCount > 0
                  ? `${stats.criticalPurchaseCount} repuesto(s) quedaron sin stock y conviene reponer primero.`
                  : "No hay productos críticos sin stock en este momento."}
              </p>
            </Link>
            <Link href={readyForPickupHref} className="card-muted dashboard-link-card">
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-primary)" }}>
                Listas para retiro
              </span>
              <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
                {stats.readyForPickup > 0 && readyForPickupOrderNumber
                  ? `Tienes ${stats.readyForPickup} OT(s) listas para retiro. Abriremos la #${String(readyForPickupOrderNumber).padStart(4, "0")}.`
                  : "No hay OTs listas para retiro en este momento."}
              </p>
            </Link>
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
              Órdenes recientes
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
              Actividad real de tus locales asignados.
            </p>
          </div>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {recentOrders.length} registro(s)
          </span>
        </div>
        {recentOrders.length > 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((orden) => {
                  const orderHref = `/ordenes?orderId=${orden.id}`

                  return (
                  <tr key={orden.id}>
                    <td style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
                      <Link href={orderHref} style={tableLinkStyle}>
                        #{String(orden.numero).padStart(4, "0")}
                      </Link>
                    </td>
                    <td>
                      <Link href={orderHref} style={tableLinkStyle}>
                        {`${orden.equipo.marca} ${orden.equipo.modelo}`}
                      </Link>
                    </td>
                    <td>
                      <Link href={orderHref} style={tableLinkStyle}>
                        {orden.cliente.nombre}
                      </Link>
                    </td>
                    <td>
                      <Link href={orderHref} style={tableLinkStyle}>
                        {orden.tecnico?.nombre ?? "Sin asignar"}
                      </Link>
                    </td>
                    <td>
                      <Link href={orderHref} style={tableLinkStyle}>
                        <span className={getEstadoBadgeClass(orden.estado)}>
                          {getEstadoLabel(orden.estado)}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <Link href={orderHref} style={tableLinkStyle}>
                        {orden.local.nombre}
                      </Link>
                    </td>
                    <td style={{ color: "var(--color-text-tertiary)" }}>
                      <Link href={orderHref} style={tableLinkStyle}>
                        {formatShortDate(orden.fechaIngreso)}
                      </Link>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">Tu dashboard ya reconoce tu cuenta</div>
            <div className="empty-state-desc">
              Aún no hay órdenes de trabajo cargadas, pero ya estamos leyendo tu usuario, tu organización y tus locales reales.
            </div>
          </div>
        )}
      </div>

      <style>{`
        .stat-card-link {
          display: block;
          color: inherit;
          text-decoration: none;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
        }
        .stat-card-link:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        .dashboard-link-card {
          display: block;
          color: inherit;
          text-decoration: none;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
        }
        .dashboard-link-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
          border-color: var(--color-border-strong);
        }
        @media (max-width: 1024px) {
          .dashboard-panels {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
