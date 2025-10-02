import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/persons/[id]/sequences - Get all active sequences for a person
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const sequences = await prisma.outreachSequence.findMany({
      where: { personId: id },
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
      orderBy: {
        startedAt: 'desc',
      },
    })

    return NextResponse.json({ sequences })
  } catch (error) {
    console.error('Error fetching person sequences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sequences' },
      { status: 500 }
    )
  }
}

// POST /api/persons/[id]/sequences - Start a new sequence for a person
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { sequenceTemplateId } = body

    if (!sequenceTemplateId) {
      return NextResponse.json(
        { error: 'sequenceTemplateId is required' },
        { status: 400 }
      )
    }

    // Verify person exists
    const person = await prisma.person.findUnique({
      where: { id },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Get the sequence template with steps
    const template = await prisma.sequenceTemplate.findUnique({
      where: { id: sequenceTemplateId },
      include: {
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Sequence template not found' },
        { status: 404 }
      )
    }

    if (template.steps.length === 0) {
      return NextResponse.json(
        { error: 'Sequence template has no steps' },
        { status: 400 }
      )
    }

    // Create the outreach sequence and copy steps in a transaction
    const sequence = await prisma.$transaction(async (tx) => {
      const now = new Date()
      
      // Calculate next step time (first step's delay)
      const firstStep = template.steps[0]
      const nextStepAt = new Date(now)
      nextStepAt.setDate(nextStepAt.getDate() + firstStep.delayDays)

      // Create the outreach sequence
      const newSequence = await tx.outreachSequence.create({
        data: {
          personId: id,
          sequenceTemplateId: template.id,
          status: 'ACTIVE',
          currentStep: 0,
          totalSteps: template.steps.length,
          nextStepAt,
          startedAt: now,
        },
      })

      // Copy template steps to sequence steps
      await tx.sequenceStep.createMany({
        data: template.steps.map((step) => ({
          sequenceId: newSequence.id,
          stepNumber: step.stepNumber,
          channel: step.channel,
          template: step.template,
          subject: step.subject,
          messageTemplateId: step.messageTemplateId,
          delayDays: step.delayDays,
          executed: false,
        })),
      })

      // Fetch the complete sequence with steps and template
      return tx.outreachSequence.findUnique({
        where: { id: newSequence.id },
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
    })

    return NextResponse.json({ sequence }, { status: 201 })
  } catch (error) {
    console.error('Error starting sequence:', error)
    return NextResponse.json(
      { error: 'Failed to start sequence' },
      { status: 500 }
    )
  }
}
