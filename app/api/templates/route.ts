import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/templates - List all message templates
export async function GET() {
  try {
    const templates = await prisma.messageTemplate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, channel, subject, body: templateBody, category, isActive } = body

    // Validate required fields
    if (!name || !channel || !templateBody) {
      return NextResponse.json(
        { error: 'Name, channel, and body are required' },
        { status: 400 }
      )
    }

    // Validate channel
    if (!['EMAIL', 'WHATSAPP', 'SMS'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be EMAIL, WHATSAPP, or SMS' },
        { status: 400 }
      )
    }

    // Validate email templates have a subject
    if (channel === 'EMAIL' && !subject) {
      return NextResponse.json(
        { error: 'Email templates must have a subject' },
        { status: 400 }
      )
    }

    const template = await prisma.messageTemplate.create({
      data: {
        name,
        description,
        channel,
        subject: channel === 'EMAIL' ? subject : null,
        body: templateBody,
        category,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
