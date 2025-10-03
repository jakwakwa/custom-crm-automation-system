import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sequences - List all sequence templates
export async function GET() {
  try {
    const sequences = await prisma.sequenceTemplate.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ sequences })
  } catch (error) {
    console.error('Error fetching sequences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sequences' },
      { status: 500 }
    )
  }
}

// POST /api/sequences - Create a new sequence template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, isActive, steps } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Create sequence template with steps in a transaction
    const sequence = await prisma.$transaction(async (tx) => {
      // Create the sequence template
      const newSequence = await tx.sequenceTemplate.create({
        data: {
          name,
          description,
          isActive: isActive ?? true,
        },
      })

      // Create steps if provided
      if (steps && Array.isArray(steps) && steps.length > 0) {
        await tx.sequenceTemplateStep.createMany({
          data: steps.map((step, index: number) => ({
            sequenceTemplateId: newSequence.id,
            stepNumber: step.stepNumber ?? index + 1,
            delayDays: step.delayDays ?? 0,
            channel: step.channel,
            subject: step.subject,
            template: step.template,
            messageTemplateId: step.messageTemplateId,
          })),
        })
      }

      // Fetch the complete sequence with steps and templates
      return tx.sequenceTemplate.findUnique({
        where: { id: newSequence.id },
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
    })

    return NextResponse.json({ sequence }, { status: 201 })
  } catch (error) {
    console.error('Error creating sequence:', error)
    return NextResponse.json(
      { error: 'Failed to create sequence' },
      { status: 500 }
    )
  }
}
