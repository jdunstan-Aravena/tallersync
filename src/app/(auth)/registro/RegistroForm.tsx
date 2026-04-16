"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { registerAction, type RegisterState } from "./actions"

type RegistroFormProps = {
  callbackUrl: string
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className="btn btn-primary"
      disabled={pending}
      style={{ width: "100%", marginTop: "var(--spacing-sm)" }}
    >
      {pending ? "Creando cuenta..." : "Crear cuenta"}
    </button>
  )
}

const initialState: RegisterState = {}

export default function RegistroForm({ callbackUrl }: RegistroFormProps) {
  const [state, formAction] = useActionState(registerAction, initialState)
  const loginHref = callbackUrl && callbackUrl !== "/"
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login"

  return (
    <>
      <div style={{ marginBottom: "var(--spacing-xl)" }}>
        <h1 style={{
          fontSize:     "var(--text-xl)",
          fontWeight:   500,
          marginBottom: 4,
          color:        "var(--color-text-primary)",
        }}>
          Crea tu cuenta
        </h1>
        <p style={{
          fontSize: "var(--text-sm)",
          color:    "var(--color-text-tertiary)",
          margin:   0,
        }}>
          Configura tu taller y tu usuario administrador en un solo paso.
        </p>
      </div>

      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div>
          <label className="form-label" htmlFor="organizacion">
            Nombre del taller
          </label>
          <input
            id="organizacion"
            name="organizacion"
            type="text"
            className={`input ${state.error ? "input-error" : ""}`}
            placeholder="Ej. TallerSync Centro"
            required
            autoComplete="organization"
            autoFocus
          />
        </div>

        <div>
          <label className="form-label" htmlFor="local">
            Local principal
          </label>
          <input
            id="local"
            name="local"
            type="text"
            className={`input ${state.error ? "input-error" : ""}`}
            placeholder="Ej. Santiago Centro"
            required
            autoComplete="organization-title"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="nombre">
            Tu nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            className={`input ${state.error ? "input-error" : ""}`}
            placeholder="Nombre y apellido"
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`input ${state.error ? "input-error" : ""}`}
            placeholder="tu@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className={`input ${state.error ? "input-error" : ""}`}
            placeholder="Mínimo 8 caracteres"
            required
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="confirmPassword">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className={`input ${state.error ? "input-error" : ""}`}
            placeholder="Repite tu contraseña"
            required
            autoComplete="new-password"
          />
          {state.error && (
            <p className="form-error">{state.error}</p>
          )}
        </div>

        <SubmitButton />

        <p style={{
          margin: 0,
          textAlign: "center",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-tertiary)",
        }}>
          ¿Ya tienes cuenta?{" "}
          <Link
            href={loginHref}
            style={{
              color: "var(--color-brand-text)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </>
  )
}
