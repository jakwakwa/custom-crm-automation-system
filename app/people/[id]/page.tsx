import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PersonDetailClient } from '@/components/people/PersonDetailClient'

interface PersonDetailPageProps {
  params: {
    id: string
  }
}

async function getPerson(id: string) {
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      relationships: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!person) {
    return null
  }

  return person
}

export default async function PersonDetailPage({ params }: PersonDetailPageProps) {
  const person = await getPerson(params.id)

  if (!person) {
    notFound()
  }

  return <PersonDetailClient person={person} />
}
