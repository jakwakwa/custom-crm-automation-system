import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch recent activities from different sources
    const [recentPeople, recentCompanies, recentProjects, recentRelationships, recentMessages] = 
      await Promise.all([
        // Recent people added
        prisma.person.findMany({
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        // Recent companies added
        prisma.company.findMany({
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        // Recent projects added
        prisma.project.findMany({
          select: {
            id: true,
            title: true,
            createdAt: true,
            company: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        // Recent relationships
        prisma.relationship.findMany({
          select: {
            id: true,
            type: true,
            createdAt: true,
            person: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            company: {
              select: {
                name: true,
              },
            },
            project: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        // Recent messages sent
        prisma.message.findMany({
          select: {
            id: true,
            channel: true,
            status: true,
            sentAt: true,
            person: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          where: {
            sentAt: { not: null },
          },
          orderBy: { sentAt: 'desc' },
          take: 5,
        }),
      ])

    // Combine and format activities
    const activities = [
      ...recentPeople.map((person) => ({
        id: `person-${person.id}`,
        type: 'person_added',
        action: 'New person added',
        details: `${person.firstName} ${person.lastName} (${person.email})`,
        timestamp: person.createdAt,
        link: `/people/${person.id}`,
      })),
      ...recentCompanies.map((company) => ({
        id: `company-${company.id}`,
        type: 'company_added',
        action: 'New company added',
        details: company.name,
        timestamp: company.createdAt,
        link: `/companies/${company.id}`,
      })),
      ...recentProjects.map((project) => ({
        id: `project-${project.id}`,
        type: 'project_added',
        action: 'New project created',
        details: `${project.title}${project.company ? ` at ${project.company.name}` : ''}`,
        timestamp: project.createdAt,
        link: `/projects/${project.id}`,
      })),
      ...recentRelationships.map((rel) => ({
        id: `relationship-${rel.id}`,
        type: 'relationship_added',
        action: `New ${rel.type.toLowerCase()} relationship`,
        details: `${rel.person.firstName} ${rel.person.lastName}${
          rel.company ? ` at ${rel.company.name}` : ''
        }${rel.project ? ` for ${rel.project.title}` : ''}`,
        timestamp: rel.createdAt,
        link: `/relationships`,
      })),
      ...recentMessages.map((message) => ({
        id: `message-${message.id}`,
        type: 'message_sent',
        action: `${message.channel} message ${message.status.toLowerCase()}`,
        details: `to ${message.person.firstName} ${message.person.lastName}`,
        timestamp: message.sentAt!,
        link: null,
      })),
    ]

    // Sort by timestamp and take the most recent 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({ activities: sortedActivities })
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}
