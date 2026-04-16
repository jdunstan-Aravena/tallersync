import { DefaultSession } from "next-auth"

// Extendemos los tipos de NextAuth para incluir nuestros campos custom
declare module "next-auth" {
  interface Session {
    user: {
      id:             string
      rol:            string
      organizacionId: string
      localId:        string | null
      localNombre:    string | null
    } & DefaultSession["user"]
  }

  interface User {
    rol:            string
    organizacionId: string
    localId:        string | null
    localNombre:    string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:             string
    rol:            string
    organizacionId: string
    localId:        string | null
    localNombre:    string | null
  }
}