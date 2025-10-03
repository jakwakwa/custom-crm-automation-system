import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sequences/[id] - Get a single sequence template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const sequence = await prisma.sequenceTemplate.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
          include: {
            messageTemplate: true,
          },
        },
      },
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ sequence })
  } catch (error) {
    console.error('Error fetching sequence:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sequence' },
      { status: 500 }
    )
  }
}

// PUT /api/sequences/[id] - Update a sequence template (metadata only, not steps)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { name, description, isActive } = body

    // Check if sequence exists
    const existingSequence = await prisma.sequenceTemplate.findUnique({
      where: { id },
    })

    if (!existingSequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    const sequence = await prisma.sequenceTemplate.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
      },
      include: {
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
          include: {
            messageTemplate: true,
          },
        },
      },
    })

    return NextResponse.json({ sequence })
  } catch (error) {
    console.error('Error updating sequence:', error)
    return NextResponse.json(
      { error: 'Failed to update sequence' },
      { status: 500 }
    )
  }
}

// DELETE /api/sequences/[id] - Delete a sequence template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if sequence exists
    const existingSequence = await prisma.sequenceTemplate.findUnique({
      where: { id },
    })

    if (!existingSequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    // Delete sequence template (cascade will handle steps)
    await prisma.sequenceTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sequence:', error)
    return NextResponse.json(
      { error: 'Failed to delete sequence' },
      { status: 500 }
    )
  }
}
