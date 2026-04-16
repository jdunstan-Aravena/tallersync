import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getDashboardContext } from "../dashboard-data"

type ConfigData = {
  organization: {
    id: string
    nombre: string
    plan: string
  }
  locales: Array<{
    id: string
    nombre: string
    esPrincipal: boolean
    activo: boolean
  }>
  usuarios: Array<{
    id: string
    nombre: string
    email: string
    rol: string
    activo: boolean
  }>
}

async function getConfigData(): Promise<ConfigData> {
  try {
    const context = await getDashboardContext()

    const organizacion = await prisma.organizacion.findUnique({
      where: { id: context.organization.id },
      select: { id: true, nombre: true, plan: true },
    })

    const locales = await prisma.local.findMany({
      where: { organizacionId: context.organization.id },
      select: {
        id: true,
        nombre: true,
        activo: true,
      },
      orderBy: { nombre: "asc" },
    })

    const usuarios = await prisma.usuario.findMany({
      where: {
        organizacionId: context.organization.id,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
      },
      orderBy: {
        creadoEn: "desc",
      },
    })

    const localesConPrincipal = locales.map((local) => ({
      ...local,
      esPrincipal: local.id === context.localPrincipal?.id,
    }))

    return {
      organization: {
        id: organizacion?.id ?? context.organization.id,
        nombre: organizacion?.nombre ?? context.organization.nombre,
        plan: organizacion?.plan ?? "FREE",
      },
      locales: localesConPrincipal,
      usuarios,
    }
  } catch (error) {
    console.error("Error fetching config:", error)
    return {
      organization: { id: "", nombre: "", plan: "FREE" },
      locales: [],
      usuarios: [],
    }
  }
}

export default async function ConfiguracionPage() {
  const data = await getConfigData()

  return (
    <div>
      <div style={{ marginBottom: "var(--spacing-2xl)" }}>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 600 }}>
          Configuración del sistema
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--color-text-tertiary)" }}>
          Gestiona locales, usuarios y preferencias de tu taller.
        </p>
      </div>

      {/* Organización */}
      <div className="card" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div style={{
          padding: "var(--spacing-lg) var(--spacing-xl)",
          borderBottom: "0.5px solid var(--color-border)",
        }}>
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, margin: 0 }}>
            Información de la organización
          </h2>
        </div>
        <div style={{ padding: "var(--spacing-xl)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--spacing-lg)" }}>
            <div>
              <label className="form-label">Nombre</label>
              <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: 500 }}>
                {data.organization.nombre}
              </p>
            </div>
            <div>
              <label className="form-label">Plan</label>
              <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", fontWeight: 500 }}>
                <span style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: data.organization.plan === "PRO" ? "rgba(168, 85, 247, 0.1)" : "rgba(107, 114, 128, 0.1)",
                  color: data.organization.plan === "PRO" ? "rgb(147, 51, 234)" : "rgb(75, 85, 99)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                }}>
                  {data.organization.plan}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Locales */}
      <div className="card" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div style={{
          padding: "var(--spacing-lg) var(--spacing-xl)",
          borderBottom: "0.5px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, margin: 0 }}>
            Locales registrados
          </h2>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {data.locales.length}
          </span>
        </div>
        {data.locales.length > 0 ? (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Principal</th>
                </tr>
              </thead>
              <tbody>
                {data.locales.map((local) => (
                  <tr key={local.id}>
                    <td style={{ fontWeight: 500 }}>{local.nombre}</td>
                    <td>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: local.activo ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: local.activo ? "rgb(22, 163, 74)" : "rgb(220, 38, 38)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                      }}>
                        {local.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      {local.esPrincipal ? (
                        <span style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                          color: "rgb(37, 99, 235)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                        }}>
                          Principal
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No hay locales registrados</div>
          </div>
        )}
      </div>

      {/* Usuarios */}
      <div className="card">
        <div style={{
          padding: "var(--spacing-lg) var(--spacing-xl)",
          borderBottom: "0.5px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, margin: 0 }}>
            Usuarios del sistema
          </h2>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {data.usuarios.length}
          </span>
        </div>
        {data.usuarios.length > 0 ? (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.usuarios.map((usuario) => {
                  const rolColor = {
                    ADMIN: "rgb(168, 85, 247)",
                    RECEPCION: "rgb(59, 130, 246)",
                    TECNICO: "rgb(34, 197, 94)",
                  }[usuario.rol as string] || "rgb(107, 114, 128)"

                  return (
                    <tr key={usuario.id}>
                      <td style={{ fontWeight: 500 }}>{usuario.nombre}</td>
                      <td style={{ color: "var(--color-text-tertiary)" }}>{usuario.email}</td>
                      <td>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: `${rolColor}20`,
                          color: rolColor,
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                        }}>
                          {usuario.rol}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: usuario.activo ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          color: usuario.activo ? "rgb(22, 163, 74)" : "rgb(220, 38, 38)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                        }}>
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No hay usuarios registrados</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: "var(--spacing-2xl)", padding: "var(--spacing-lg)", backgroundColor: "rgba(107, 114, 128, 0.08)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)" }}>
          💡 <strong>Nota:</strong> Para crear nuevos usuarios o cambiar roles, contacta al administrador del sistema.
        </p>
      </div>
    </div>
  )
}
