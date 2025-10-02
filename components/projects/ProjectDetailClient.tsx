'use client'

import { ArrowLeft, Briefcase, Building2, Calendar, Edit, Mail, Phone, Trash, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ON_HOLD'
type RelationshipType = 'CLIENT' | 'CANDIDATE' | 'BOTH'

interface ProjectDetailClientProps {
  project: {
    id: string
    title: string
    description: string | null
    status: ProjectStatus
    createdAt: Date
    updatedAt: Date
    closedAt: Date | null
    company: {
      id: string
      name: string
      industry: string | null
      website: string | null
    }
    relationships: Array<{
      id: string
      type: RelationshipType
      notes: string | null
      person: {
        id: string
        firstName: string
        lastName: string
        email: string
        phone: string | null
      }
    }>
    _count: {
      relationships: number
    }
  }
}

const statusColors = {
  OPEN: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  IN_PROGRESS: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  CLOSED: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  ON_HOLD: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
}

const typeColors = {
  CLIENT: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200',
  CANDIDATE: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200',
  BOTH: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200',
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter()

  const clients = project.relationships.filter((r) => r.type === 'CLIENT' || r.type === 'BOTH')
  const candidates = project.relationships.filter((r) => r.type === 'CANDIDATE' || r.type === 'BOTH')

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete')
      }
      toast.success('Project deleted successfully')
      router.push('/projects')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete project')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Project Details</h1>
          <p className="text-muted-foreground">View project information and candidates</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/projects`)}>
          <Edit className="mr-2 size-4" />
          Edit
        </Button>
        <Button variant="outline" onClick={handleDelete}>
          <Trash className="mr-2 size-4" />
          Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex size-24 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Briefcase className="size-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                <Badge className={`${statusColors[project.status]} mb-4`}>
                  {project.status.replace('_', ' ')}
                </Badge>
                <Link
                  href={`/companies/${project.company.id}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Building2 className="size-4" />
                  {project.company.name}
                </Link>
              </div>
              {project.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total People</span>
                <span className="text-lg font-semibold">{project._count.relationships}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Clients</span>
                <span className="text-lg font-semibold">{clients.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Candidates</span>
                <span className="text-lg font-semibold">{candidates.length}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Calendar className="size-3" />
                  <span>Created</span>
                </div>
                <p className="text-sm">{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
              {project.closedAt && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="size-3" />
                    <span>Closed</span>
                  </div>
                  <p className="text-sm">{new Date(project.closedAt).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Candidates ({candidates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No candidates yet</p>
              ) : (
                <div className="space-y-3">
                  {candidates.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/people/${rel.person.id}`}
                      className="block p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="size-4" />
                          <span className="font-medium">
                            {rel.person.firstName} {rel.person.lastName}
                          </span>
                        </div>
                        <Badge variant="outline" className={typeColors[rel.type]}>
                          {rel.type}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="size-3" />
                          {rel.person.email}
                        </div>
                        {rel.person.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="size-3" />
                            {rel.person.phone}
                          </div>
                        )}
                      </div>
                      {rel.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          &quot;{rel.notes}&quot;
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {clients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Clients ({clients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/people/${rel.person.id}`}
                      className="block p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="size-4" />
                          <span className="font-medium">
                            {rel.person.firstName} {rel.person.lastName}
                          </span>
                        </div>
                        <Badge variant="outline" className={typeColors[rel.type]}>
                          {rel.type}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="size-3" />
                          {rel.person.email}
                        </div>
                        {rel.person.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="size-3" />
                            {rel.person.phone}
                          </div>
                        )}
                      </div>
                      {rel.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          &quot;{rel.notes}&quot;
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
