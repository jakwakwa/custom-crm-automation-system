import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProjectDetailClient } from '@/components/projects/ProjectDetailClient'

interface ProjectDetailPageProps {
  params: {
    id: string
  }
}

async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
          website: true,
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
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          relationships: true,
        },
      },
    },
  })

  if (!project) {
    return null
  }

  return project
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  return <ProjectDetailClient project={project} />
}
