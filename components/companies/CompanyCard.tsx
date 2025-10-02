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
import { Building2, Globe, Briefcase, Users, MoreVertical, Edit, Trash, ExternalLink } from 'lucide-react'

interface CompanyCardProps {
  company: {
    id: string
    name: string
    industry?: string | null
    website?: string | null
    description?: string | null
    createdAt: Date
    _count?: {
      projects: number
      relationships: number
    }
  }
  onEdit?: (company: any) => void
  onDelete?: (id: string) => void
  onView?: (company: any) => void
}

export function CompanyCard({ company, onEdit, onDelete, onView }: CompanyCardProps) {
  const projectCount = company._count?.projects ?? 0
  const relationshipCount = company._count?.relationships ?? 0

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (company.website) {
      window.open(
        company.website.startsWith('http') ? company.website : `https://${company.website}`,
        '_blank'
      )
    }
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        {/* Header with Icon and Actions */}
        <div className="mb-4 flex items-start justify-between">
          <div
            className="flex size-12 cursor-pointer items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20"
            onClick={() => onView?.(company)}
          >
            <Building2 className="size-6" />
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
              <DropdownMenuItem onClick={() => onView?.(company)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(company)}>
                <Edit className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(company.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Company Name */}
        <h3
          className="mb-2 cursor-pointer text-lg font-semibold hover:text-primary"
          onClick={() => onView?.(company)}
        >
          {company.name}
        </h3>

        {/* Industry Badge */}
        {company.industry && (
          <Badge variant="secondary" className="mb-3 text-xs">
            {company.industry}
          </Badge>
        )}

        {/* Website */}
        {company.website && (
          <button
            onClick={handleWebsiteClick}
            className="mb-3 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <Globe className="size-3.5" />
            <span className="truncate">{company.website}</span>
            <ExternalLink className="size-3" />
          </button>
        )}

        {/* Description */}
        {company.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {company.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-4 border-t pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="size-3.5" />
            <span>{projectCount} {projectCount === 1 ? 'project' : 'projects'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            <span>{relationshipCount} {relationshipCount === 1 ? 'contact' : 'contacts'}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
        Added {new Date(company.createdAt).toLocaleDateString()}
      </CardFooter>
    </Card>
  )
}
