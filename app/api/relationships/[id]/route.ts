import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/relationships/[id] - Get a single relationship by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const relationship = await prisma.relationship.findUnique({
      where: { id: params.id },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            whatsapp: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            website: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            description: true,
          },
        },
      },
    })

    if (!relationship) {
      return NextResponse.json(
        { error: 'Relationship not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ relationship })
  } catch (error) {
    console.error('Error fetching relationship:', error)
    return NextResponse.json(
      { error: 'Failed to fetch relationship' },
      { status: 500 }
    )
  }
}

// PUT /api/relationships/[id] - Update a relationship
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { companyId, projectId, type, notes } = body

    // Check if relationship exists
    const existingRelationship = await prisma.relationship.findUnique({
      where: { id: params.id },
    })

    if (!existingRelationship) {
      return NextResponse.json(
        { error: 'Relationship not found' },
        { status: 404 }
      )
    }

    // Validate relationship type if provided
    if (type && !['CLIENT', 'CANDIDATE', 'BOTH'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid relationship type' },
        { status: 400 }
      )
    }

    // Check if company exists (if provided and changed)
    if (companyId && companyId !== existingRelationship.companyId) {
      const companyExists = await prisma.company.findUnique({
        where: { id: companyId },
      })

      if (!companyExists) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        )
      }
    }

    // Check if project exists (if provided and changed)
    if (projectId && projectId !== existingRelationship.projectId) {
      const projectExists = await prisma.project.findUnique({
        where: { id: projectId },
      })

      if (!projectExists) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
    }

    // Update relationship
    const relationship = await prisma.relationship.update({
      where: { id: params.id },
      data: {
        companyId: companyId || null,
        projectId: projectId || null,
        type,
        notes,
      },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({ relationship })
  } catch (error) {
    console.error('Error updating relationship:', error)
    return NextResponse.json(
      { error: 'Failed to update relationship' },
      { status: 500 }
    )
  }
}

// DELETE /api/relationships/[id] - Delete a relationship
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if relationship exists
    const existingRelationship = await prisma.relationship.findUnique({
      where: { id: params.id },
    })

    if (!existingRelationship) {
      return NextResponse.json(
        { error: 'Relationship not found' },
        { status: 404 }
      )
    }

    // Delete relationship
    await prisma.relationship.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting relationship:', error)
    return NextResponse.json(
      { error: 'Failed to delete relationship' },
      { status: 500 }
    )
  }
}
