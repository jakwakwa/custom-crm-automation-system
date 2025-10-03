import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/templates/[id] - Get a single template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const template = await prisma.messageTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

// PUT /api/templates/[id] - Update a template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { name, description, channel, subject, body: templateBody, category, isActive } = body

    // Check if template exists
    const existingTemplate = await prisma.messageTemplate.findUnique({
      where: { id },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Validate channel if provided
    if (channel && !['EMAIL', 'WHATSAPP', 'SMS'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be EMAIL, WHATSAPP, or SMS' },
        { status: 400 }
      )
    }

    // Validate email templates have a subject
    const finalChannel = channel || existingTemplate.channel
    if (finalChannel === 'EMAIL' && !subject && !existingTemplate.subject) {
      return NextResponse.json(
        { error: 'Email templates must have a subject' },
        { status: 400 }
      )
    }

    const template = await prisma.messageTemplate.update({
      where: { id },
      data: {
        name,
        description,
        channel,
        subject: finalChannel === 'EMAIL' ? subject : null,
        body: templateBody,
        category,
        isActive,
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Check if template exists
    const existingTemplate = await prisma.messageTemplate.findUnique({
      where: { id },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Delete template
    await prisma.messageTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
