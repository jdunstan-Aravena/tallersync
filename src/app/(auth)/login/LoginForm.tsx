"use client"

import Link from "next/link"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

type LoginFormProps = {
  callbackUrl: string
  registered?: boolean
}

function normalizeRedirectUrl(url: string) {
  try {
    const normalized = new URL(url, window.location.origin)
    return `${normalized.pathname}${normalized.search}${normalized.hash}`
  } catch {
    return "/"
  }
}

export default function LoginForm({ callbackUrl, registered = false }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const registerHref = callbackUrl && callbackUrl !== "/"
    ? `/registro?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/registro"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    setLoading(false)

    if (result?.error || !result?.url) {
      setError("Email o contraseña incorrectos.")
    } else {
      router.replace(normalizeRedirectUrl(result.url))
      router.refresh()
    }
  }

  return (
    <>
      <div style={{ marginBottom: "var(--spacing-xl)" }}>
        <h1 style={{
          fontSize:     "var(--text-xl)",
          fontWeight:   500,
          marginBottom: 4,
          color:        "var(--color-text-primary)",
        }}>
          Bienvenido
        </h1>
        <p style={{
          fontSize: "var(--text-sm)",
          color:    "var(--color-text-tertiary)",
          margin:   0,
        }}>
          Ingresa tus datos para continuar
        </p>
        {registered && (
          <p
            style={{
              marginTop: "var(--spacing-md)",
              marginBottom: 0,
              fontSize: "var(--text-sm)",
              color: "var(--color-brand-text)",
            }}
          >
            Tu cuenta fue creada. Ahora puedes iniciar sesión.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>

        {/* Email */}
        <div>
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`input ${error ? "input-error" : ""}`}
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        {/* Contraseña */}
        <div>
          <label className="form-label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className={`input ${error ? "input-error" : ""}`}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && (
            <p className="form-error">{error}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: "100%", marginTop: "var(--spacing-sm)" }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg
                className="animate-spin"
                width="14" height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              Ingresando...
            </span>
          ) : (
            "Ingresar"
          )}
        </button>

        <p style={{
          margin: 0,
          textAlign: "center",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-tertiary)",
        }}>
          ¿No tienes cuenta?{" "}
          <Link
            href={registerHref}
            style={{
              color: "var(--color-brand-text)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Regístrate
          </Link>
        </p>

      </form>
    </>
  )
}
