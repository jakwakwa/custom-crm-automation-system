'use client'

import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Edit,
  Mail,
  MessageSquare,
  Phone,
  Trash,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type RelationshipType = 'CLIENT' | 'CANDIDATE' | 'BOTH'
type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ON_HOLD'

interface PersonDetailClientProps {
  person: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    whatsapp: string | null
    createdAt: Date
    updatedAt: Date
    relationships: Array<{
      id: string
      type: RelationshipType
      notes: string | null
      createdAt: Date
      company: {
        id: string
        name: string
        industry: string | null
      } | null
      project: {
        id: string
        title: string
        status: ProjectStatus
      } | null
    }>
  }
}

const typeColors = {
  CLIENT: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200',
  CANDIDATE: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200',
  BOTH: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200',
}

const statusColors = {
  OPEN: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  IN_PROGRESS: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  CLOSED: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  ON_HOLD: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
}

export function PersonDetailClient({ person }: PersonDetailClientProps) {
  const router = useRouter()
  const fullName = `${person.firstName} ${person.lastName}`
  const initials = `${person.firstName[0]}${person.lastName[0]}`.toUpperCase()

  // Group relationships by type
  const clientRelationships = person.relationships.filter((r) => r.type === 'CLIENT' || r.type === 'BOTH')
  const candidateRelationships = person.relationships.filter((r) => r.type === 'CANDIDATE' || r.type === 'BOTH')

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this person? This will also delete all associated relationships.')) {
      return
    }

    try {
      const response = await fetch(`/api/persons/${person.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete person')

      toast.success('Person deleted successfully')
      router.push('/people')
    } catch {
      toast.error('Failed to delete person')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Person Details</h1>
          <p className="text-muted-foreground">
            View and manage contact information
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/people`)}>
          <Edit className="mr-2 size-4" />
          Edit
        </Button>
        <Button variant="outline" onClick={handleDelete}>
          <Trash className="mr-2 size-4" />
          Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="size-24 mb-4">
                  <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <div className="mt-4 space-y-3 w-full">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="size-4 text-muted-foreground" />
                    <a
                      href={`mailto:${person.email}`}
                      className="text-primary hover:underline"
                    >
                      {person.email}
                    </a>
                  </div>
                  {person.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="size-4 text-muted-foreground" />
                      <a
                        href={`tel:${person.phone}`}
                        className="text-primary hover:underline"
                      >
                        {person.phone}
                      </a>
                    </div>
                  )}
                  {person.whatsapp && (
                    <div className="flex items-center gap-3 text-sm">
                      <MessageSquare className="size-4 text-muted-foreground" />
                      <a
                        href={`https://wa.me/${person.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {person.whatsapp}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Relationships</span>
                <span className="text-lg font-semibold">{person.relationships.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">As Client</span>
                <span className="text-lg font-semibold">{clientRelationships.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">As Candidate</span>
                <span className="text-lg font-semibold">{candidateRelationships.length}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Calendar className="size-3" />
                  <span>Added</span>
                </div>
                <p className="text-sm">{new Date(person.createdAt).toLocaleDateString()}</p>
              </div>
              {person.updatedAt && person.updatedAt.getTime() !== person.createdAt.getTime() && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="size-3" />
                    <span>Last Updated</span>
                  </div>
                  <p className="text-sm">{new Date(person.updatedAt).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Relationships */}
        <div className="space-y-6 lg:col-span-2">
          {/* Client Relationships */}
          <Card>
            <CardHeader>
              <CardTitle>Client Relationships ({clientRelationships.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {clientRelationships.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No client relationships yet
                </p>
              ) : (
                <div className="space-y-4">
                  {clientRelationships.map((relationship) => (
                    <div
                      key={relationship.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Badge variant="outline" className={typeColors[relationship.type]}>
                            {relationship.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(relationship.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {relationship.company && (
                        <Link
                          href={`/companies/${relationship.company.id}`}
                          className="flex items-center gap-2 text-sm font-medium hover:text-primary mb-1"
                        >
                          <Building2 className="size-4" />
                          {relationship.company.name}
                          {relationship.company.industry && (
                            <span className="text-xs text-muted-foreground">
                              • {relationship.company.industry}
                            </span>
                          )}
                        </Link>
                      )}
                      {relationship.project && (
                        <Link
                          href={`/projects/${relationship.project.id}`}
                          className="flex items-center gap-2 text-sm hover:text-primary"
                        >
                          <Briefcase className="size-4" />
                          {relationship.project.title}
                          <Badge className={`ml-2 text-xs ${statusColors[relationship.project.status]}`}>
                            {relationship.project.status.replace('_', ' ')}
                          </Badge>
                        </Link>
                      )}
                      {relationship.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          &quot;{relationship.notes}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Candidate Relationships */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Relationships ({candidateRelationships.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {candidateRelationships.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No candidate relationships yet
                </p>
              ) : (
                <div className="space-y-4">
                  {candidateRelationships.map((relationship) => (
                    <div
                      key={relationship.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Badge variant="outline" className={typeColors[relationship.type]}>
                            {relationship.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(relationship.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {relationship.company && (
                        <Link
                          href={`/companies/${relationship.company.id}`}
                          className="flex items-center gap-2 text-sm font-medium hover:text-primary mb-1"
                        >
                          <Building2 className="size-4" />
                          {relationship.company.name}
                          {relationship.company.industry && (
                            <span className="text-xs text-muted-foreground">
                              • {relationship.company.industry}
                            </span>
                          )}
                        </Link>
                      )}
                      {relationship.project && (
                        <Link
                          href={`/projects/${relationship.project.id}`}
                          className="flex items-center gap-2 text-sm hover:text-primary"
                        >
                          <Briefcase className="size-4" />
                          {relationship.project.title}
                          <Badge className={`ml-2 text-xs ${statusColors[relationship.project.status]}`}>
                            {relationship.project.status.replace('_', ' ')}
                          </Badge>
                        </Link>
                      )}
                      {relationship.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          &quot;{relationship.notes}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
