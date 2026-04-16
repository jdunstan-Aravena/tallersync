'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  activo: boolean
  creadoEn: Date
}

interface CategoriasTableProps {
  categorias: Categoria[]
}

export function CategoriasTable({ categorias }: CategoriasTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error('Error deleting category')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (categorias.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay categorías creadas aún. Crea tu primera categoría arriba.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Creado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {categoria.nombre}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {categoria.descripcion || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(categoria.creadoEn).toLocaleDateString('es-ES')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDelete(categoria.id)}
                  disabled={deletingId === categoria.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === categoria.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}