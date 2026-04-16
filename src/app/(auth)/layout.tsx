export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
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
        {children}
      </div>
      <p className="auth-tagline">Todos tus talleres, un solo ritmo.</p>
      <style>{`
        .auth-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: var(--color-background-soft);
          padding: var(--spacing-xl);
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: var(--color-surface);
          border: 0.5px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--spacing-2xl);
          box-shadow: var(--shadow-md);
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-2xl);
        }
        .auth-tagline {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }
      `}</style>
    </div>
  )
}