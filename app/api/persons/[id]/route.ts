import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/persons/[id] - Get a single person by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        relationships: true,
        outreachSequences: true,
        messageHistory: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    return NextResponse.json({ person })
  } catch (error) {
    console.error('Error fetching person:', error)
    return NextResponse.json(
      { error: 'Failed to fetch person' },
      { status: 500 }
    )
  }
}

// PUT /api/persons/[id] - Update a person
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, whatsapp } = body

    const person = await prisma.person.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName,
        phone,
        whatsapp,
      },
    })

    return NextResponse.json({ person })
  } catch (error) {
    console.error('Error updating person:', error)
    return NextResponse.json(
      { error: 'Failed to update person' },
      { status: 500 }
    )
  }
}

// DELETE /api/persons/[id] - Delete a person
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.person.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting person:', error)
    return NextResponse.json(
      { error: 'Failed to delete person' },
      { status: 500 }
    )
  }
}
