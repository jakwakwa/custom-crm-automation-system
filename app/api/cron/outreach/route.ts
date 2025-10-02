import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'

// This route is called daily by Vercel Cron
// Configure in vercel.json: { "cron": [{ "path": "/api/cron/outreach", "schedule": "0 9 * * *" }] }
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Find all active sequences where the next step is due
    const dueSequences = await prisma.outreachSequence.findMany({
      where: {
        status: 'ACTIVE',
        nextStepAt: {
          lte: now,
        },
      },
      include: {
        person: true,
        steps: {
          where: {
            executed: false,
          },
          orderBy: {
            stepNumber: 'asc',
          },
          take: 1,
        },
      },
    })

    console.log(`Found ${dueSequences.length} sequences due for processing`)

    // Process each sequence
    const results = await Promise.allSettled(
      dueSequences.map(async (sequence) => {
        if (sequence.steps.length === 0) {
          // No more steps, mark sequence as completed
          await prisma.outreachSequence.update({
            where: { id: sequence.id },
            data: {
              status: 'COMPLETED',
              completedAt: now,
              nextStepAt: null,
            },
          })
          return { sequenceId: sequence.id, status: 'completed' }
        }

        const currentStep = sequence.steps[0]

        // Trigger Inngest event to send the message
        await inngest.send({
          name: 'outreach/send.message',
          data: {
            personId: sequence.personId,
            sequenceId: sequence.id,
            stepId: currentStep.id,
            channel: currentStep.channel,
            body: currentStep.template,
            subject: undefined, // You can add subject logic here
          },
        })

        // Calculate next step date
        const nextStepNumber = currentStep.stepNumber + 1
        const nextStep = await prisma.sequenceStep.findFirst({
          where: {
            sequenceId: sequence.id,
            stepNumber: nextStepNumber,
          },
        })

        let nextStepAt: Date | null = null
        if (nextStep) {
          const daysToAdd = nextStep.delayDays
          nextStepAt = new Date(now)
          nextStepAt.setDate(nextStepAt.getDate() + daysToAdd)
        }

        // Update sequence
        await prisma.outreachSequence.update({
          where: { id: sequence.id },
          data: {
            currentStep: currentStep.stepNumber,
            nextStepAt,
            status: nextStepAt ? 'ACTIVE' : 'COMPLETED',
            completedAt: nextStepAt ? null : now,
          },
        })

        return {
          sequenceId: sequence.id,
          status: 'message_sent',
          nextStepAt,
        }
      })
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      processed: dueSequences.length,
      successful,
      failed,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
