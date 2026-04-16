import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"

type ReportData = {
  totalOrdenesCreadas: number
  ordenesPorEstado: Record<string, number>
  ordenesPendientes: number
  ordenesSinTecnico: number
  equiposMasReparados: Array<{ tipo: string; cantidad: number }>
  clientesMasReparaciones: Array<{ nombre: string; cantidad: number }>
  ingresosTotales: string
  repuestosBaratos: number
  repuestosCostosos: number
}

async function getReportData(): Promise<ReportData> {
  try {
    const context = await getDashboardContext()
    const localId = context.localPrincipal?.id

    if (!localId) {
      return {
        totalOrdenesCreadas: 0,
        ordenesPorEstado: {},
        ordenesPendientes: 0,
        ordenesSinTecnico: 0,
        equiposMasReparados: [],
        clientesMasReparaciones: [],
        ingresosTotales: "0.00",
        repuestosBaratos: 0,
        repuestosCostosos: 0,
      }
    }

    // Total de órdenes
    const totalOrdenes = await prisma.ordenTrabajo.count({
      where: { localId },
    })

    // Órdenes por estado
    const ordenesPorEstado = await prisma.ordenTrabajo.groupBy({
      by: ["estado"],
      where: { localId },
      _count: true,
    })

    const estadoMap = Object.fromEntries(
      ordenesPorEstado.map((item) => [item.estado, item._count])
    )

    // Órdenes pendientes (sin entregar)
    const pendientes = await prisma.ordenTrabajo.count({
      where: {
        localId,
        estado: {
          notIn: ["ENTREGADO", "CANCELADO"],
        },
      },
    })

    // Órdenes sin técnico asignado
    const sinTecnico = await prisma.ordenTrabajo.count({
      where: {
        localId,
        tecnicoId: null,
        estado: {
          notIn: ["ENTREGADO", "CANCELADO"],
        },
      },
    })

    // Equipos más reparados
    const equiposMas = await prisma.ordenTrabajo.groupBy({
      by: ["equipoId"],
      where: { localId },
      _count: true,
    })

    const equiposData = await Promise.all(
      equiposMas.slice(0, 5).map(async (item) => {
        const equipo = await prisma.equipo.findUnique({
          where: { id: item.equipoId },
          select: { tipo: true },
        })
        return {
          tipo: equipo?.tipo ?? "Desconocido",
          cantidad: item._count,
        }
      })
    )

    // Clientes con más reparaciones
    const clientesMas = await prisma.ordenTrabajo.groupBy({
      by: ["clienteId"],
      where: { localId },
      _count: true,
    })

    const clientesData = await Promise.all(
      clientesMas.slice(0, 5).map(async (item) => {
        const cliente = await prisma.cliente.findUnique({
          where: { id: item.clienteId },
          select: { nombre: true },
        })
        return {
          nombre: cliente?.nombre ?? "Desconocido",
          cantidad: item._count,
        }
      })
    )

    // Ingresos totales
    const ordenes = await prisma.ordenTrabajo.aggregate({
      where: {
        localId,
        estado: "ENTREGADO",
      },
      _sum: {
        total: true,
      },
    })

    const ingresos = ordenes._sum.total?.toString() ?? "0.00"

    // Repuestos bajo precio y caro
    const stockStats = await prisma.repuesto.aggregate({
      where: { localId },
      _count: {
        id: true,
      },
    })

    const baratos = await prisma.repuesto.count({
      where: {
        localId,
        precioVenta: {
          lt: 50,
        },
      },
    })

    const costosos = await prisma.repuesto.count({
      where: {
        localId,
        precioVenta: {
          gte: 500,
        },
      },
    })

    return {
      totalOrdenesCreadas: totalOrdenes,
      ordenesPorEstado: estadoMap,
      ordenesPendientes: pendientes,
      ordenesSinTecnico: sinTecnico,
      equiposMasReparados: equiposData,
      clientesMasReparaciones: clientesData,
      ingresosTotales: ingresos,
      repuestosBaratos: baratos,
      repuestosCostosos: costosos,
    }
  } catch (error) {
    console.error("Error fetching report data:", error)
    return {
      totalOrdenesCreadas: 0,
      ordenesPorEstado: {},
      ordenesPendientes: 0,
      ordenesSinTecnico: 0,
      equiposMasReparados: [],
      clientesMasReparaciones: [],
      ingresosTotales: "0.00",
      repuestosBaratos: 0,
      repuestosCostosos: 0,
    }
  }
}

export default async function ReportesPage() {
  const data = await getReportData()

  return (
    <div>
      <div style={{ marginBottom: "var(--spacing-2xl)" }}>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600 }}>
          Reportes y estadísticas
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--color-text-tertiary)" }}>
          Visualiza métricas clave de tu taller.
        </p>
      </div>

      {/* Cards principales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--spacing-lg)", marginBottom: "var(--spacing-2xl)" }}>
        <div className="card">
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "8px" }}>
            Total de órdenes creadas
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {data.totalOrdenesCreadas}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "8px" }}>
            Órdenes pendientes
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 600, color: "var(--color-warning, #f59e0b)" }}>
            {data.ordenesPendientes}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "8px" }}>
            Sin técnico asignado
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 600, color: "var(--color-error, #ef4444)" }}>
            {data.ordenesSinTecnico}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "8px" }}>
            Ingresos totales
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 600, color: "var(--color-success, #22c55e)" }}>
            ${parseFloat(data.ingresosTotales).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Gráficos y tablas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "var(--spacing-lg)" }}>
        {/* Estados de órdenes */}
        <div className="card">
          <h3 style={{ margin: "0 0 var(--spacing-md)", fontSize: "var(--text-md)", fontWeight: 600 }}>
            Órdenes por estado
          </h3>
          {Object.entries(data.ordenesPorEstado).length > 0 ? (
            <div style={{ display: "grid", gap: "var(--spacing-sm)" }}>
              {Object.entries(data.ordenesPorEstado).map(([estado, cantidad]) => (
                <div key={estado} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--spacing-sm)", borderBottom: "0.5px solid var(--color-border)" }}>
                  <span style={{ fontSize: "var(--text-sm)" }}>{estado}</span>
                  <span style={{ fontWeight: 600, backgroundColor: "rgba(59, 130, 246, 0.1)", padding: "4px 8px", borderRadius: "4px", fontSize: "var(--text-sm)" }}>
                    {cantidad}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-sm)" }}>No hay datos disponibles</p>
          )}
        </div>

        {/* Equipos más reparados */}
        <div className="card">
          <h3 style={{ margin: "0 0 var(--spacing-md)", fontSize: "var(--text-md)", fontWeight: 600 }}>
            Equipos más reparados
          </h3>
          {data.equiposMasReparados.length > 0 ? (
            <div style={{ display: "grid", gap: "var(--spacing-sm)" }}>
              {data.equiposMasReparados.map((item) => (
                <div key={item.tipo} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--spacing-sm)", borderBottom: "0.5px solid var(--color-border)" }}>
                  <span style={{ fontSize: "var(--text-sm)" }}>{item.tipo}</span>
                  <span style={{ fontWeight: 600, backgroundColor: "rgba(34, 197, 94, 0.1)", padding: "4px 8px", borderRadius: "4px", fontSize: "var(--text-sm)" }}>
                    {item.cantidad}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-sm)" }}>No hay datos disponibles</p>
          )}
        </div>

        {/* Clientes más reparaciones */}
        <div className="card">
          <h3 style={{ margin: "0 0 var(--spacing-md)", fontSize: "var(--text-md)", fontWeight: 600 }}>
            Clientes frecuentes
          </h3>
          {data.clientesMasReparaciones.length > 0 ? (
            <div style={{ display: "grid", gap: "var(--spacing-sm)" }}>
              {data.clientesMasReparaciones.map((item) => (
                <div key={item.nombre} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--spacing-sm)", borderBottom: "0.5px solid var(--color-border)" }}>
                  <span style={{ fontSize: "var(--text-sm)" }}>{item.nombre}</span>
                  <span style={{ fontWeight: 600, backgroundColor: "rgba(168, 85, 247, 0.1)", padding: "4px 8px", borderRadius: "4px", fontSize: "var(--text-sm)" }}>
                    {item.cantidad}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-sm)" }}>No hay datos disponibles</p>
          )}
        </div>

        {/* Inventario */}
        <div className="card">
          <h3 style={{ margin: "0 0 var(--spacing-md)", fontSize: "var(--text-md)", fontWeight: 600 }}>
            Estado del inventario
          </h3>
          <div style={{ display: "grid", gap: "var(--spacing-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--spacing-sm)", borderBottom: "0.5px solid var(--color-border)" }}>
              <span style={{ fontSize: "var(--text-sm)" }}>Repuestos bajo precio (&lt; $50)</span>
              <span style={{ fontWeight: 600, backgroundColor: "rgba(34, 197, 94, 0.1)", padding: "4px 8px", borderRadius: "4px", fontSize: "var(--text-sm)" }}>
                {data.repuestosBaratos}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "var(--text-sm)" }}>Repuestos costosos (&ge; $500)</span>
              <span style={{ fontWeight: 600, backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "4px 8px", borderRadius: "4px", fontSize: "var(--text-sm)" }}>
                {data.repuestosCostosos}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
