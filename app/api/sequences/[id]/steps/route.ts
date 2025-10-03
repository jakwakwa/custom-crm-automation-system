import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sequences/[id]/steps - List all steps for a sequence template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if sequence template exists
    const sequence = await prisma.sequenceTemplate.findUnique({
      where: { id },
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    const steps = await prisma.sequenceTemplateStep.findMany({
      where: { sequenceTemplateId: id },
      include: {
        messageTemplate: true,
      },
      orderBy: {
        stepNumber: 'asc',
      },
    })

    return NextResponse.json({ steps })
  } catch (error) {
    console.error('Error fetching sequence steps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sequence steps' },
      { status: 500 }
    )
  }
}

// POST /api/sequences/[id]/steps - Create a new step for a sequence template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { stepNumber, delayDays, channel, subject, template, messageTemplateId } = body

    // Check if sequence template exists
    const sequence = await prisma.sequenceTemplate.findUnique({
      where: { id },
    })

    if (!sequence) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (channel === undefined) {
      return NextResponse.json(
        { error: 'Channel is required' },
        { status: 400 }
      )
    }

    // Validate that either messageTemplateId or template is provided
    if (!messageTemplateId && !template) {
      return NextResponse.json(
        { error: 'Either messageTemplateId or template must be provided' },
        { status: 400 }
      )
    }

    // If no stepNumber provided, set it to the next available number
    let stepNum = stepNumber
    if (stepNum === undefined) {
      const lastStep = await prisma.sequenceTemplateStep.findFirst({
        where: { sequenceTemplateId: id },
        orderBy: { stepNumber: 'desc' },
      })
      stepNum = (lastStep?.stepNumber ?? 0) + 1
    }

    const step = await prisma.sequenceTemplateStep.create({
      data: {
        sequenceTemplateId: id,
        stepNumber: stepNum,
        delayDays: delayDays ?? 0,
        channel,
        subject,
        template: template || '',
        messageTemplateId,
      },
      include: {
        messageTemplate: true,
      },
    })

    return NextResponse.json({ step }, { status: 201 })
  } catch (error) {
    console.error('Error creating sequence step:', error)
    return NextResponse.json(
      { error: 'Failed to create sequence step' },
      { status: 500 }
    )
  }
}
