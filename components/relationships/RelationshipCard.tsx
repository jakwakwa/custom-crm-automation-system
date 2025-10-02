'use client'

import { User, Building2, FolderOpen, Eye, Pencil, Trash2, Users } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type RelationshipType = 'CLIENT' | 'CANDIDATE' | 'BOTH'

interface Relationship {
  id: string
  type: RelationshipType
  notes: string | null
  createdAt: Date
  person: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  company?: {
    id: string
    name: string
  } | null
  project?: {
    id: string
    title: string
  } | null
}

interface RelationshipCardProps {
  relationship: Relationship
  onView: (relationship: Relationship) => void
  onEdit: (relationship: Relationship) => void
  onDelete: (relationship: Relationship) => void
}

const typeColors = {
  CLIENT: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  CANDIDATE: 'bg-green-500/10 text-green-700 dark:text-green-400',
  BOTH: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
}

export function RelationshipCard({ relationship, onView, onEdit, onDelete }: RelationshipCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {relationship.person.firstName} {relationship.person.lastName}
              </h3>
              <Badge className={`mt-1 ${typeColors[relationship.type]}`}>
                {relationship.type}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{relationship.person.email}</span>
        </div>

        {relationship.company && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{relationship.company.name}</span>
          </div>
        )}

        {relationship.project && (
          <div className="flex items-center gap-2 text-sm">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{relationship.project.title}</span>
          </div>
        )}

        {relationship.notes && (
          <div className="text-sm text-muted-foreground pt-2 border-t">
            <p className="line-clamp-2">{relationship.notes}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          Added {new Date(relationship.createdAt).toLocaleDateString()}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView(relationship)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(relationship)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(relationship)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
