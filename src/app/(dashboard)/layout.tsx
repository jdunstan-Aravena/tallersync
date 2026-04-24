import Link from "next/link"
import { signOut } from "@/auth"
import { getDashboardContext, type DashboardLocal } from "./dashboard-data"

function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IconOrdenes() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function IconTecnicos() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 8c0-.828.672-1.5 1.5-1.5h4c.828 0 1.5.672 1.5 1.5v4c0 .828-.672 1.5-1.5 1.5h-4c-.828 0-1.5-.672-1.5-1.5v-4z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="11" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.5 8c0-.828.672-1.5 1.5-1.5h4c.828 0 1.5.672 1.5 1.5v4c0 .828-.672 1.5-1.5 1.5h-4c-.828 0-1.5-.672-1.5-1.5v-4z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IconClientes() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 13.5C2.5 11.015 5.015 9 8 9s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconAgenda() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconStock() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12L8 3l6 9H2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconCategorias() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12v8H2z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 2v2M6 2v2M10 2v2M12 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 7h6M5 9h4M5 11h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function IconProveedores() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 4.5h11v7h-11z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 4.5V3a1 1 0 011-1h4a1 1 0 011 1v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.5 8h11" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IconReportes() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12l3.5-4 3 2.5 3-5L14 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconAI() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

function IconConfig() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M3.4 12.6l.85-.85M11.75 4.25l.85-.85"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10.5 11L14 8l-3.5-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconLocal() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5C4.79 1.5 3 3.29 3 5.5c0 3 4 7 4 7s4-4 4-7c0-2.21-1.79-4-4-4z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const navMain: NavItem[] = [
  { href: "/", label: "Dashboard", icon: <IconDashboard /> },
  { href: "/ordenes", label: "Órdenes", icon: <IconOrdenes />, badge: 0 },
  { href: "/clientes", label: "Clientes", icon: <IconClientes /> },
  { href: "/tecnicos", label: "Técnicos", icon: <IconTecnicos /> },
  { href: "/agenda", label: "Agenda", icon: <IconAgenda /> },
]

const navOperaciones: NavItem[] = [
  { href: "/stock", label: "Stock", icon: <IconStock /> },
  { href: "/proveedores", label: "Proveedores", icon: <IconProveedores /> },
  { href: "/categorias", label: "Categorías", icon: <IconCategorias /> },
  { href: "/reportes", label: "Reportes", icon: <IconReportes /> },
  { href: "/ai", label: "SyncAI", icon: <IconAI /> },
]

const navConfig: NavItem[] = [
  { href: "/configuracion", label: "Configuración", icon: <IconConfig /> },
]

type SidebarProps = {
  organizationName: string
  user: {
    nombre: string
    rolLabel: string
    initials: string
  }
  locales: DashboardLocal[]
  localPrincipal: DashboardLocal | null
}

function Sidebar({ organizationName, user, locales, localPrincipal }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="6.5" width="9" height="2" rx="1" fill="white" opacity="0.9" />
            <rect x="2" y="10" width="7" height="2" rx="1" fill="white" opacity="0.7" />
            <rect x="2" y="13.5" width="8" height="2" rx="1" fill="white" opacity="0.55" />
            <path d="M13 2.5L16 5.5L13 8.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 5.5L10.5 5.5L10.5 15.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="sidebar-brand-name">
          Taller<span>Sync</span>
        </span>
      </div>
      <div className="sidebar-org-name">{organizationName}</div>

      <div style={{ padding: "0 12px", marginBottom: "8px" }}>
        <div className="local-selector" style={{ width: "100%", alignItems: "flex-start", cursor: "default" }}>
          <IconLocal />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-local-caption">Local principal</div>
            <div className="sidebar-local-name">
              {localPrincipal?.nombre ?? "Sin local asignado"}
            </div>
            <div className="sidebar-local-count">
              {locales.length} {locales.length === 1 ? "local asignado" : "locales asignados"}
            </div>
          </div>
        </div>
        {locales.length > 0 && (
          <div className="sidebar-local-list">
            {locales.map((local) => (
              <div key={local.id} className="sidebar-local-pill">
                <span>{local.nombre}</span>
                {local.esPrincipal && (
                  <span className="sidebar-local-pill-tag">Principal</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <nav style={{ flex: 1, overflow: "auto" }}>
        <div className="sidebar-section-label">Principal</div>
        {navMain.map((item) => (
          <SidebarItem key={item.href} item={item} />
        ))}

        <div className="sidebar-section-label">Operaciones</div>
        {navOperaciones.map((item) => (
          <SidebarItem key={item.href} item={item} />
        ))}

        <div className="sidebar-section-label">Sistema</div>
        {navConfig.map((item) => (
          <SidebarItem key={item.href} item={item} />
        ))}
      </nav>

      <SidebarFooter user={user} />
    </aside>
  )
}

function SidebarItem({ item }: { item: NavItem }) {
  return (
    <Link href={item.href} className="sidebar-item">
      {item.icon}
      <span>{item.label}</span>
      {item.badge != null && item.badge > 0 && (
        <span className="sidebar-item-badge">{item.badge}</span>
      )}
    </Link>
  )
}

function SidebarFooter({ user }: { user: SidebarProps["user"] }) {
  return (
    <div className="sidebar-footer">
      <div className="sidebar-user">
        <div className="sidebar-avatar">{user.initials}</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{user.nombre}</span>
          <span className="sidebar-user-role">{user.rolLabel}</span>
        </div>
      </div>
      <form action={async () => {
        "use server"
        await signOut({ redirectTo: "/login" })
      }}>
        <button
          type="submit"
          className="btn btn-ghost btn-sm sidebar-logout"
          title="Cerrar sesión"
        >
          <IconLogout />
        </button>
      </form>
    </div>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await getDashboardContext()

  return (
    <div className="dashboard-shell">
      <Sidebar
        organizationName={context.organization.nombre}
        user={context.user}
        locales={context.locales}
        localPrincipal={context.localPrincipal}
      />
      <div className="dashboard-main">
        {children}
      </div>

      <style>{`
        .dashboard-shell {
          display: flex;
          min-height: 100vh;
          background: var(--color-background-soft);
        }
        .dashboard-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .sidebar-org-name {
          padding: 0 var(--spacing-xl);
          margin-top: calc(var(--spacing-2xl) * -1);
          margin-bottom: var(--spacing-xl);
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }
        .sidebar-local-caption {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .sidebar-local-name {
          font-size: var(--text-sm);
          color: var(--color-text-primary);
          font-weight: var(--font-weight-medium);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-local-count {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          margin-top: 2px;
        }
        .sidebar-local-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: var(--spacing-sm);
        }
        .sidebar-local-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-sm);
          padding: 8px 10px;
          border-radius: var(--radius-md);
          background: var(--color-background);
          border: 0.5px solid var(--color-border);
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
        }
        .sidebar-local-pill-tag {
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--color-brand-subtle);
          color: var(--color-brand-text);
          font-size: 11px;
          font-weight: var(--font-weight-medium);
          white-space: nowrap;
        }
        .sidebar-footer {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-lg) var(--spacing-lg);
          border-top: 0.5px solid var(--color-border);
          margin-top: auto;
        }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex: 1;
          min-width: 0;
        }
        .sidebar-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--color-brand-subtle);
          color: var(--color-brand-text);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sidebar-user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .sidebar-user-name {
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-user-role {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }
        .sidebar-logout {
          flex-shrink: 0;
          color: var(--color-text-tertiary);
        }
        .sidebar-logout:hover {
          color: var(--color-red-600);
          background: var(--color-red-50);
        }
      `}</style>
    </div>
  )
}
