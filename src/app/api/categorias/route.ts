import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.organizacionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { nombre, descripcion } = await request.json()

    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'Nombre is required' }, { status: 400 })
    }

    // Check if category already exists for this organization
    const existingCategory = await prisma.categoriaRepuesto.findFirst({
      where: {
        organizacionId: session.user.organizacionId,
        nombre: nombre.trim(),
        activo: true,
      },
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 })
    }

    const categoria = await prisma.categoriaRepuesto.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        organizacionId: session.user.organizacionId,
      },
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.organizacionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categorias = await prisma.categoriaRepuesto.findMany({
      where: {
        organizacionId: session.user.organizacionId,
        activo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}