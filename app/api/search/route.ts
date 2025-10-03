import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const type = searchParams.get('type') // Optional filter: 'person', 'company', 'project', 'relationship'

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        people: [],
        companies: [],
        projects: [],
        relationships: [],
        total: 0,
      })
    }

    const searchTerm = query.trim()

    // Parallel searches across all entity types
    const [people, companies, projects, relationships] = await Promise.all([
      // Search People
      (!type || type === 'person')
        ? prisma.person.findMany({
            where: {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { phone: { contains: searchTerm, mode: 'insensitive' } },
                { whatsapp: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            take: 10,
            orderBy: { updatedAt: 'desc' },
          })
        : [],

      // Search Companies
      (!type || type === 'company')
        ? prisma.company.findMany({
            where: {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { industry: { contains: searchTerm, mode: 'insensitive' } },
                { website: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            take: 10,
            orderBy: { updatedAt: 'desc' },
          })
        : [],

      // Search Projects
      (!type || type === 'project')
        ? prisma.project.findMany({
            where: {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            take: 10,
            orderBy: { updatedAt: 'desc' },
          })
        : [],

      // Search Relationships (by notes)
      (!type || type === 'relationship')
        ? prisma.relationship.findMany({
            where: {
              notes: { contains: searchTerm, mode: 'insensitive' },
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
            take: 10,
            orderBy: { updatedAt: 'desc' },
          })
        : [],
    ])

    const total = people.length + companies.length + projects.length + relationships.length

    return NextResponse.json({
      people,
      companies,
      projects,
      relationships,
      total,
      query: searchTerm,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}
