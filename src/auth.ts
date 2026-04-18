import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

type SessionToken = {
  id?: string
  rol?: string
  organizacionId?: string
  localId?: string | null
  localNombre?: string | null
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutos en segundos
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
          include: {
            organizacion: true,
            locales: {
              where: { esPrincipal: true },
              include: { local: true },
              take: 1,
            },
          },
        })

        if (!usuario || !usuario.activo) return null

        const passwordOk = await bcrypt.compare(
          credentials.password as string,
          usuario.passwordHash
        )

        if (!passwordOk) return null

        // 🔴 NORMALIZACIÓN DE DATOS (CLAVE)
        return {
          id: String(usuario.id),
          name: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol ?? "USER",
          organizacionId: usuario.organizacionId ?? "",
          localId: usuario.locales[0]?.localId ?? null,
          localNombre: usuario.locales[0]?.local?.nombre ?? null,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // 🔴 FORZAMOS consistencia de tipos
        token.id = user.id as string

        const u = user as {
          rol?: string
          organizacionId?: string
          localId?: string | null
          localNombre?: string | null
        }

        token.rol = u.rol ?? "USER"
        token.organizacionId = u.organizacionId ?? ""
        token.localId = u.localId ?? null
        token.localNombre = u.localNombre ?? null
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        const sessionToken = token as typeof token & SessionToken

        // 🔴 EVITAMOS undefined en toda la sesión
        session.user.id = sessionToken.id ?? ""
        session.user.rol = sessionToken.rol ?? "USER"
        session.user.organizacionId = sessionToken.organizacionId ?? ""
        session.user.localId = sessionToken.localId ?? null
        session.user.localNombre = sessionToken.localNombre ?? null
      }

      return session
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user

      const isPublicRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/registro") ||
        nextUrl.pathname.startsWith("/seguimiento") ||
        nextUrl.pathname.startsWith("/api/auth")

      // 🔓 Rutas públicas
      if (isPublicRoute) {
        if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
          return Response.redirect(new URL("/", nextUrl))
        }
        return true
      }

      // 🔒 Rutas privadas
      return isLoggedIn
    },
  },
})
