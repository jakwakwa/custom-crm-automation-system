import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sequences/[id]/steps/[stepId] - Get a single step from a sequence template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id, stepId } = await params
  try {
    const step = await prisma.sequenceTemplateStep.findUnique({
      where: { id: stepId },
      include: {
        messageTemplate: true,
      },
    })

    if (!step || step.sequenceTemplateId !== id) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ step })
  } catch (error) {
    console.error('Error fetching sequence step:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sequence step' },
      { status: 500 }
    )
  }
}

// PUT /api/sequences/[id]/steps/[stepId] - Update a step in a sequence template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id, stepId } = await params
  try {
    const body = await request.json()
    const { stepNumber, delayDays, channel, subject, template, messageTemplateId } = body

    // Check if step exists and belongs to the sequence template
    const existingStep = await prisma.sequenceTemplateStep.findUnique({
      where: { id: stepId },
    })

    if (!existingStep || existingStep.sequenceTemplateId !== id) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      )
    }

    // Validate that either messageTemplateId or template is provided if both are being updated
    if (messageTemplateId === null && !template && !existingStep.template) {
      return NextResponse.json(
        { error: 'Either messageTemplateId or template must be provided' },
        { status: 400 }
      )
    }

    const step = await prisma.sequenceTemplateStep.update({
      where: { id: stepId },
      data: {
        stepNumber,
        delayDays,
        channel,
        subject,
        template,
        messageTemplateId,
      },
      include: {
        messageTemplate: true,
      },
    })

    return NextResponse.json({ step })
  } catch (error) {
    console.error('Error updating sequence step:', error)
    return NextResponse.json(
      { error: 'Failed to update sequence step' },
      { status: 500 }
    )
  }
}

// DELETE /api/sequences/[id]/steps/[stepId] - Delete a step from a sequence template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id, stepId } = await params
  try {
    // Check if step exists and belongs to the sequence template
    const existingStep = await prisma.sequenceTemplateStep.findUnique({
      where: { id: stepId },
    })

    if (!existingStep || existingStep.sequenceTemplateId !== id) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      )
    }

    // Delete step
    await prisma.sequenceTemplateStep.delete({
      where: { id: stepId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sequence step:', error)
    return NextResponse.json(
      { error: 'Failed to delete sequence step' },
      { status: 500 }
    )
  }
}
