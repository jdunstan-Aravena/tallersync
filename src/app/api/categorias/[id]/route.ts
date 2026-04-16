import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.organizacionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const categoria = await prisma.categoriaRepuesto.findFirst({
      where: {
        id: id,
        organizacionId: session.user.organizacionId,
      },
    })

    if (!categoria) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Soft delete by setting activo to false
    await prisma.categoriaRepuesto.update({
      where: { id: id },
      data: { activo: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}