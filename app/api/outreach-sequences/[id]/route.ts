import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// PATCH /api/outreach-sequences/[id] - Pause, resume, or cancel a sequence
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { action } = body // 'pause', 'resume', or 'cancel'

    const sequence = await prisma.outreachSequence.findUnique({
      where: { id },
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    const now = new Date()
    let updateData: Prisma.OutreachSequenceUpdateInput = {}

    switch (action) {
      case 'pause':
        if (sequence.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Can only pause active sequences' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'PAUSED',
          pausedAt: now,
        }
        break

      case 'resume':
        if (sequence.status !== 'PAUSED') {
          return NextResponse.json(
            { error: 'Can only resume paused sequences' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'ACTIVE',
          pausedAt: null,
        }
        break

      case 'cancel':
        if (sequence.status === 'COMPLETED' || sequence.status === 'CANCELLED') {
          return NextResponse.json(
            { error: 'Sequence is already completed or cancelled' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'CANCELLED',
          completedAt: now,
          nextStepAt: null,
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use pause, resume, or cancel' },
          { status: 400 }
        )
    }

    const updated = await prisma.outreachSequence.update({
      where: { id },
      data: updateData,
      include: {
        sequenceTemplate: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
      },
    })

    return NextResponse.json({ sequence: updated })
  } catch (error) {
    console.error('Error updating sequence:', error)
    return NextResponse.json(
      { error: 'Failed to update sequence' },
      { status: 500 }
    )
  }
}

// DELETE /api/outreach-sequences/[id] - Delete an active sequence
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const sequence = await prisma.outreachSequence.findUnique({
      where: { id },
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    await prisma.outreachSequence.delete({
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
