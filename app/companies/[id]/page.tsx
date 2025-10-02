import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CompanyDetailClient } from '@/components/companies/CompanyDetailClient'

interface CompanyDetailPageProps {
  params: {
    id: string
  }
}

async function getCompany(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              relationships: true,
            },
          },
        },
      },
      relationships: {
        include: {
          person: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
      },
      _count: {
        select: {
          projects: true,
          relationships: true,
        },
      },
    },
  })

  if (!company) {
    return null
  }

  return company
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const company = await getCompany(params.id)

  if (!company) {
    notFound()
  }

  return <CompanyDetailClient company={company} />
}
