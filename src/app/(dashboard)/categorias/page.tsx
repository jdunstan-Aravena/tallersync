import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { CategoriasTable } from './CategoriasTable'
import { CreateCategoriaForm } from './CreateCategoriaForm'

export default async function CategoriasPage() {
  const session = await auth()
  if (!session?.user?.organizacionId) {
    redirect('/auth/login')
  }

  const categorias = await prisma.categoriaRepuesto.findMany({
    where: {
      organizacionId: session.user.organizacionId,
      activo: true
    },
    orderBy: {
      nombre: 'asc'
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categorías de Repuestos</h1>
        <p className="text-gray-600 mt-2">
          Gestiona las categorías de repuestos para organizar mejor tu inventario
        </p>
      </div>

      <div className="grid gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Crear Nueva Categoría</h2>
          <CreateCategoriaForm />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Categorías Existentes</h2>
          <CategoriasTable categorias={categorias} />
        </div>
      </div>
    </div>
  )
}