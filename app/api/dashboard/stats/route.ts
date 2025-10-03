import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch current counts
    const [
      totalPeople,
      totalCompanies,
      activeProjects,
      messagesSent,
      peopleLastMonth,
      companiesLastMonth,
      projectsLastMonth,
      messagesLastWeek,
    ] = await Promise.all([
      prisma.person.count(),
      prisma.company.count(),
      prisma.project.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.message.count({ where: { sentAt: { not: null } } }),
      prisma.person.count({ where: { createdAt: { gte: lastMonth } } }),
      prisma.company.count({ where: { createdAt: { gte: lastMonth } } }),
      prisma.project.count({ where: { createdAt: { gte: lastMonth } } }),
      prisma.message.count({ where: { sentAt: { gte: lastWeek } } }),
    ])

    // Calculate previous period counts for percentage changes
    const [
      peopleTwoMonthsAgo,
      companiesTwoMonthsAgo,
      projectsTwoMonthsAgo,
      messagesTwoWeeksAgo,
    ] = await Promise.all([
      prisma.person.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()),
            lt: lastMonth,
          },
        },
      }),
      prisma.company.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()),
            lt: lastMonth,
          },
        },
      }),
      prisma.project.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()),
            lt: lastMonth,
          },
        },
      }),
      prisma.message.count({
        where: {
          sentAt: {
            gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            lt: lastWeek,
          },
        },
      }),
    ])

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Number((((current - previous) / previous) * 100).toFixed(1))
    }

    const stats = {
      totalPeople,
      totalCompanies,
      activeProjects,
      messagesSent,
      changes: {
        people: calculateChange(peopleLastMonth, peopleTwoMonthsAgo),
        companies: calculateChange(companiesLastMonth, companiesTwoMonthsAgo),
        projects: calculateChange(projectsLastMonth, projectsTwoMonthsAgo),
        messages: calculateChange(messagesLastWeek, messagesTwoWeeksAgo),
      },
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
