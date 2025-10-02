'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Briefcase, Building2, Users, MoreVertical, Edit, Trash, Calendar } from 'lucide-react'

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description?: string | null
    status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ON_HOLD'
    createdAt: Date
    closedAt?: Date | null
    company: {
      id: string
      name: string
      industry?: string | null
    }
    _count?: {
      relationships: number
    }
  }
  onEdit?: (project: any) => void
  onDelete?: (id: string) => void
  onView?: (project: any) => void
}

const statusConfig = {
  OPEN: { label: 'Open', variant: 'default' as const, color: 'text-blue-500' },
  IN_PROGRESS: { label: 'In Progress', variant: 'secondary' as const, color: 'text-yellow-500' },
  CLOSED: { label: 'Closed', variant: 'outline' as const, color: 'text-gray-500' },
  ON_HOLD: { label: 'On Hold', variant: 'outline' as const, color: 'text-orange-500' },
}

export function ProjectCard({ project, onEdit, onDelete, onView }: ProjectCardProps) {
  const relationshipCount = project._count?.relationships ?? 0
  const statusInfo = statusConfig[project.status]

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        {/* Header with Icon and Actions */}
        <div className="mb-4 flex items-start justify-between">
          <div
            className="flex size-12 cursor-pointer items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20"
            onClick={() => onView?.(project)}
          >
            <Briefcase className="size-6" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(project)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(project)}>
                <Edit className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(project.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badge */}
        <div className="mb-3">
          <Badge variant={statusInfo.variant} className="text-xs">
            {statusInfo.label}
          </Badge>
        </div>

        {/* Project Title */}
        <h3
          className="mb-2 cursor-pointer text-lg font-semibold hover:text-primary"
          onClick={() => onView?.(project)}
        >
          {project.title}
        </h3>

        {/* Company Info */}
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="size-3.5" />
          <span className="truncate">{project.company.name}</span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-4 border-t pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            <span>{relationshipCount} {relationshipCount === 1 ? 'candidate' : 'candidates'}</span>
          </div>
          {project.closedAt && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>Closed {new Date(project.closedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
        Created {new Date(project.createdAt).toLocaleDateString()}
      </CardFooter>
    </Card>
  )
}
