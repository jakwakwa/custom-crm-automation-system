import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/relationships - List all relationships
export async function GET() {
  try {
    const relationships = await prisma.relationship.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit results
    })

    return NextResponse.json({ relationships })
  } catch (error) {
    console.error('Error fetching relationships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch relationships' },
      { status: 500 }
    )
  }
}

// POST /api/relationships - Create a new relationship
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { personId, companyId, projectId, type, notes } = body

    // Validate required fields
    if (!personId || !type) {
      return NextResponse.json(
        { error: 'Person and relationship type are required' },
        { status: 400 }
      )
    }

    // Validate relationship type
    if (!['CLIENT', 'CANDIDATE', 'BOTH'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid relationship type' },
        { status: 400 }
      )
    }

    // Check if person exists
    const personExists = await prisma.person.findUnique({
      where: { id: personId },
    })

    if (!personExists) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Check if company exists (if provided)
    if (companyId) {
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

    // Check if project exists (if provided)
    if (projectId) {
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

    // Check for duplicate relationship
    const existingRelationship = await prisma.relationship.findFirst({
      where: {
        personId,
        companyId: companyId || null,
        projectId: projectId || null,
        type,
      },
    })

    if (existingRelationship) {
      return NextResponse.json(
        { error: 'This relationship already exists' },
        { status: 400 }
      )
    }

    const relationship = await prisma.relationship.create({
      data: {
        personId,
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

    return NextResponse.json({ relationship }, { status: 201 })
  } catch (error) {
    console.error('Error creating relationship:', error)
    return NextResponse.json(
      { error: 'Failed to create relationship' },
      { status: 500 }
    )
  }
}
