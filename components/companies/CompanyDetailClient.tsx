'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDateReadable } from '@/utils/date'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Building2, Globe, Briefcase, Users, Edit, Trash, Calendar, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { CompanyForm } from './CompanyForm'

type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ON_HOLD'
type RelationshipType = 'CLIENT' | 'CANDIDATE' | 'BOTH'

interface CompanyDetailClientProps {
  company: {
    id: string
    name: string
    industry: string | null
    website: string | null
    description: string | null
    createdAt: Date
    updatedAt: Date
    projects: Array<{
      id: string
      title: string
      status: ProjectStatus
      createdAt: Date
      _count: {
        relationships: number
      }
    }>
    relationships: Array<{
      id: string
      type: RelationshipType
      person: {
        id: string
        firstName: string
        lastName: string
        email: string
      }
      project: {
        id: string
        title: string
      } | null
    }>
    _count: {
      projects: number
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

export function CompanyDetailClient({ company }: CompanyDetailClientProps) {
  const router = useRouter()
  const [editFormOpen, setEditFormOpen] = useState(false)

  const handleEdit = () => {
    setEditFormOpen(true)
  }

  const handleFormSuccess = () => {
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this company?')) return

    try {
      const response = await fetch(`/api/companies/${company.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete company')
      toast.success('Company deleted successfully')
      router.push('/companies')
    } catch {
      toast.error('Failed to delete company')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Company Details</h1>
          <p className="text-muted-foreground">View company information and projects</p>
        </div>
        <Button variant="outline" onClick={handleEdit}>
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
                  <Building2 className="size-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{company.name}</h2>
                {company.industry && (
                  <Badge variant="secondary" className="mb-4">{company.industry}</Badge>
                )}
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Globe className="size-4" />
                    Visit Website
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              {company.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">{company.description}</p>
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
                <span className="text-sm text-muted-foreground">Total Projects</span>
                <span className="text-lg font-semibold">{company._count.projects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total People</span>
                <span className="text-lg font-semibold">{company._count.relationships}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Calendar className="size-3" />
                  <span>Added</span>
                </div>
                <p className="text-sm">{formatDateReadable(company.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Projects ({company.projects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {company.projects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No projects yet</p>
              ) : (
                <div className="space-y-3">
                  {company.projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="size-4" />
                          <span className="font-medium">{project.title}</span>
                        </div>
                        <Badge className={statusColors[project.status]}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{project._count.relationships} candidates</span>
                        <span>•</span>
                        <span>{formatDateReadable(project.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>People ({company.relationships.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {company.relationships.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No people yet</p>
              ) : (
                <div className="space-y-3">
                  {company.relationships.map((rel) => (
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
                      <div className="text-sm text-muted-foreground">
                        {rel.person.email}
                        {rel.project && ` • ${rel.project.title}`}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Form Dialog */}
      <CompanyForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        company={company}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
